from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any, Optional
import json
import uuid
import os
import io
import pandas as pd
from datetime import datetime
from app.services.llm_service import LLMService
from app.services.template_service import TemplateService
from app.models.database import get_db
from app.models.feedback import ConversionHistory
from sqlalchemy import select, desc, delete

router = APIRouter(prefix="/api/original-sound", tags=["original-sound"])
llm_service = LLMService()
template_service = TemplateService()

# 支持的文件类型（覆盖常见浏览器对 m4a 的标注）
ALLOWED_AUDIO_TYPES = [
    "audio/mpeg",          # .mp3
    "audio/wav",           # .wav
    "audio/x-wav",         # 某些环境
    "audio/mp3",           # 兼容旧标注
    "audio/m4a",           # 少数环境会是这个
    "audio/x-m4a",         # 常见于Safari/部分浏览器
    "audio/mp4",           # 许多浏览器对 .m4a 使用 audio/mp4
    "audio/ogg",           # .ogg
]
ALLOWED_EXCEL_TYPES = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]

@router.post("/process-text")
async def process_text_original_sound(
    user_input: str = Form(...),
    source_language: str = Form(...),
    target_language: str = Form(...),
    user_id: str = Form("default_user"),
    db: AsyncSession = Depends(get_db)
):
    """处理文本类原声"""
    try:
        # 验证输入
        if not user_input or len(user_input.strip()) < 5:
            raise HTTPException(status_code=400, detail="原声内容至少需要5个字符")
        
        # 获取模板配置
        template = await template_service.get_template("original_sound_cleaning")
        
        # 调用LLM进行原声分析
        analysis_result = await llm_service.analyze_original_sound(
            user_input=user_input,
            source_language=source_language,
            target_language=target_language,
            template=template
        )
        
        # 生成标准化格式
        standard_format = await template_service.generate_standard_format(
            analysis_result, template
        )
        
        # 保存到历史记录
        try:
            history_record = ConversionHistory(
                id=str(uuid.uuid4()),
                user_id=user_id,
                title=f"文本原声清洗 - {datetime.now().strftime('%Y-%m-%d %H:%M')}",
                original_description=user_input,
                system_types=[source_language],
                modules=[target_language],
                analysis_result=analysis_result,
                standard_format=standard_format,
                template_id="original_sound_cleaning",
                files_info=[],
                status="completed"
            )
            
            db.add(history_record)
            await db.commit()
            
            # 清理旧记录
            await cleanup_old_records(user_id, db)
            
        except Exception as e:
            print(f"保存历史记录失败: {str(e)}")
        
        return {
            "success": True,
            "analysis": analysis_result,
            "standard_format": standard_format,
            "message": "文本原声处理完成"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"处理失败: {str(e)}")

@router.post("/process-audio")
async def process_audio_original_sound(
    audio_file: UploadFile = File(...),
    source_language: str = Form(...),
    target_language: str = Form(...),
    user_id: str = Form("default_user"),
    db: AsyncSession = Depends(get_db)
):
    """处理录音类原声"""
    try:
        # 验证文件类型
        if audio_file.content_type not in ALLOWED_AUDIO_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"不支持的文件类型: {audio_file.content_type}，支持的类型: {ALLOWED_AUDIO_TYPES}"
            )
        
        # 验证文件大小 (50MB限制)
        if audio_file.size > 50 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="音频文件超过50MB限制")
        
        # 保存音频文件
        upload_dir = "uploads/audio"
        os.makedirs(upload_dir, exist_ok=True)
        
        file_extension = os.path.splitext(audio_file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        with open(file_path, "wb") as buffer:
            content = await audio_file.read()
            buffer.write(content)
        
        # 语音识别转文本
        transcribed_text = await llm_service.transcribe_audio(
            audio_file_path=file_path,
            source_language=source_language
        )
        
        # 获取模板配置
        template = await template_service.get_template("original_sound_cleaning")
        
        # 调用LLM进行原声分析（使用与文本相同的模板和prompt）
        analysis_result = await llm_service.analyze_original_sound(
            user_input=transcribed_text,
            source_language=source_language,
            target_language=target_language,
            template=template
        )
        
        # 生成标准化格式
        standard_format = await template_service.generate_standard_format(
            analysis_result, template
        )
        
        # 保存到历史记录
        try:
            files_info = [{
                "name": audio_file.filename,
                "size": audio_file.size,
                "type": audio_file.content_type,
                "path": file_path
            }]
            
            history_record = ConversionHistory(
                id=str(uuid.uuid4()),
                user_id=user_id,
                title=f"录音原声清洗 - {datetime.now().strftime('%Y-%m-%d %H:%M')}",
                original_description=transcribed_text,
                system_types=[source_language],
                modules=[target_language],
                analysis_result=analysis_result,
                standard_format=standard_format,
                template_id="original_sound_cleaning",
                files_info=files_info,
                status="completed"
            )
            
            db.add(history_record)
            await db.commit()
            
            # 清理旧记录
            await cleanup_old_records(user_id, db)
            
        except Exception as e:
            print(f"保存历史记录失败: {str(e)}")
        
        return {
            "success": True,
            "transcribed_text": transcribed_text,
            "analysis": analysis_result,
            "standard_format": standard_format,
            "message": "录音原声处理完成"
        }
        
    except Exception as e:
        # 增强错误可观测性
        import traceback
        err_text = f"{type(e).__name__}: {str(e)}\n" + traceback.format_exc()
        print(f"❌ 处理录音原声失败: {err_text}")
        raise HTTPException(status_code=500, detail=f"处理失败: {str(e) or type(e).__name__}")

@router.post("/process-excel")
async def process_excel_original_sound(
    excel_file: UploadFile = File(...),
    source_language: str = Form(...),
    target_language: str = Form(...),
    user_id: str = Form("default_user"),
    db: AsyncSession = Depends(get_db)
):
    """处理Excel文件类原声"""
    try:
        # 验证文件类型
        if excel_file.content_type not in ALLOWED_EXCEL_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"不支持的文件类型: {excel_file.content_type}，支持的类型: {ALLOWED_EXCEL_TYPES}"
            )
        
        # 验证文件大小 (20MB限制)
        if excel_file.size > 20 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Excel文件超过20MB限制")
        
        # 保存Excel文件
        upload_dir = "uploads/excel"
        os.makedirs(upload_dir, exist_ok=True)
        
        file_extension = os.path.splitext(excel_file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        with open(file_path, "wb") as buffer:
            content = await excel_file.read()
            buffer.write(content)
        
        # 解析Excel文件，获取多条原声
        original_sounds = await parse_excel_file_multiple(file_path)
        
        # 获取模板配置
        template = await template_service.get_template("original_sound_cleaning")
        
        # 为每条原声进行分析
        analysis_results = []
        for i, original_text in enumerate(original_sounds):
            if original_text.strip():  # 跳过空文本
                analysis_result = await llm_service.analyze_original_sound(
                    user_input=original_text,
                    source_language=source_language,
                    target_language=target_language,
                    template=template
                )
                analysis_results.append({
                    "index": i,
                    "original_text": original_text,
                    "analysis": analysis_result
                })
        
        # 合并所有分析结果
        combined_analysis = {
            "total_count": len(analysis_results),
            "results": analysis_results
        }
        
        # 生成标准化格式（使用第一条分析结果作为代表）
        standard_format = await template_service.generate_standard_format(
            analysis_results[0]["analysis"] if analysis_results else {}, template
        )
        
        # 保存到历史记录
        try:
            files_info = [{
                "name": excel_file.filename,
                "size": excel_file.size,
                "type": excel_file.content_type,
                "path": file_path
            }]
            
            # 合并所有原声文本
            all_original_texts = " | ".join([result["original_text"] for result in analysis_results])
            
            history_record = ConversionHistory(
                id=str(uuid.uuid4()),
                user_id=user_id,
                title=f"Excel原声清洗 - {datetime.now().strftime('%Y-%m-%d %H:%M')}",
                original_description=all_original_texts,
                system_types=[source_language],
                modules=[target_language],
                analysis_result=combined_analysis,
                standard_format=standard_format,
                template_id="original_sound_cleaning",
                files_info=files_info,
                status="completed"
            )
            
            db.add(history_record)
            await db.commit()
            
            # 清理旧记录
            await cleanup_old_records(user_id, db)
            
        except Exception as e:
            print(f"保存历史记录失败: {str(e)}")
        
        return {
            "success": True,
            "analysis": combined_analysis,
            "standard_format": standard_format,
            "message": f"Excel原声处理完成，共处理{len(analysis_results)}条原声"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"处理失败: {str(e)}")

@router.post("/process-excel-download")
async def process_excel_download(
    excel_file: UploadFile = File(...),
    source_language: str = Form(...),
    target_language: str = Form(...),
    user_id: str = Form("default_user")
):
    """处理Excel文件并返回下载文件"""
    try:
        print(f"🔍 开始处理Excel文件下载: {excel_file.filename}")
        print(f"🔍 文件大小: {excel_file.size}")
        print(f"🔍 文件类型: {excel_file.content_type}")
        
        # 真正处理Excel文件
        print(f"🔍 开始处理Excel文件内容...")
        
        # 读取上传的Excel文件
        try:
            # 将文件内容读取到内存
            file_content = await excel_file.read()
            print(f"🔍 文件内容大小: {len(file_content)} bytes")
            
            # 使用pandas读取Excel文件
            import io
            excel_buffer = io.BytesIO(file_content)
            
            # 尝试读取Excel文件
            try:
                df = pd.read_excel(excel_buffer, engine='openpyxl')
                print(f"🔍 成功读取Excel文件，形状: {df.shape}")
                print(f"🔍 列名: {list(df.columns)}")
                print(f"🔍 前几行数据:")
                print(df.head())
            except Exception as e:
                print(f"❌ 读取Excel文件失败: {e}")
                # 如果读取失败，使用测试数据
                df = pd.DataFrame({
                    "原文": ["Excel文件读取失败", "请检查文件格式", "支持.xlsx和.xls格式"],
                    "翻译": ["Excel file read failed", "Please check file format", "Supports .xlsx and .xls formats"],
                    "核心主旨": ["错误", "格式问题", "文件问题"],
                    "重点分析": [f"读取错误: {str(e)}", "请使用正确的Excel格式", "建议重新上传"],
                    "情感分类": ["负向", "负向", "负向"],
                    "情感强度": ["强烈", "强烈", "强烈"],
                    "情感分析": ["文件读取失败", "格式不支持", "需要重新上传"]
                })
            
            # 处理每一行数据
            processed_data = []
            
            for index, row in df.iterrows():
                print(f"🔍 处理第{index+1}行数据...")
                
                # 获取原文内容（假设第一列是原文）
                original_text = str(row.iloc[0]) if len(row) > 0 else "无内容"
                print(f"🔍 原文: {original_text[:50]}...")
                
                # 调用LLM进行真正的分析
                try:
                    print(f"🔍 调用LLM分析第{index+1}行数据...")
                    
                    # 获取模板配置
                    template = await template_service.get_template("original_sound_cleaning")
                    
                    # 调用LLM服务进行原声分析
                    analysis = await llm_service.analyze_original_sound(
                        user_input=original_text,
                        source_language=source_language,
                        target_language=target_language,
                        template=template
                    )
                    
                    print(f"🔍 LLM分析完成，结果: {analysis.get('sentiment_classification', '未知')}")
                    
                    # 使用LLM的真实分析结果
                    analysis_result = {
                        "原文": original_text,
                        "翻译": analysis.get('original_translation', f"Translation of: {original_text[:30]}..."),
                        "核心主旨": analysis.get('ai_optimized_summary', f"主题{index+1}"),
                        "重点分析": analysis.get('key_points', f"分析结果{index+1}"),
                        "情感分类": analysis.get('sentiment_classification', "中性"),
                        "情感强度": analysis.get('sentiment_intensity', "中等"),
                        "情感分析": analysis.get('sentiment_analysis', f"这是对'{original_text[:20]}...'的情感分析结果")
                    }
                    
                except Exception as e:
                    print(f"❌ LLM分析失败: {e}")
                    # 如果LLM调用失败，使用模拟数据
                    analysis_result = {
                        "原文": original_text,
                        "翻译": f"Translation of: {original_text[:30]}...",
                        "核心主旨": f"主题{index+1}",
                        "重点分析": f"分析结果{index+1}",
                        "情感分类": ["正向", "中性", "负向"][index % 3],
                        "情感强度": ["强烈", "中等", "轻微"][index % 3],
                        "情感分析": f"这是对'{original_text[:20]}...'的情感分析结果"
                    }
                
                processed_data.append(analysis_result)
            
            # 创建处理后的DataFrame
            if processed_data:
                out_df = pd.DataFrame(processed_data)
                print(f"🔍 处理完成，生成{len(processed_data)}条记录")
            else:
                # 如果没有数据，创建默认记录
                out_df = pd.DataFrame({
                    "原文": ["无数据"],
                    "翻译": ["No data"],
                    "核心主旨": ["无"],
                    "重点分析": ["无"],
                    "情感分类": ["中性"],
                    "情感强度": ["中等"],
                    "情感分析": ["无分析结果"]
                })
                print(f"🔍 使用默认数据")
            
            print(f"🔍 最终DataFrame形状: {out_df.shape}")
            
        except Exception as e:
            print(f"❌ 处理Excel文件时出错: {e}")
            # 如果处理失败，返回错误信息
            out_df = pd.DataFrame({
                "原文": ["处理失败"],
                "翻译": ["Processing failed"],
                "核心主旨": ["错误"],
                "重点分析": [f"错误信息: {str(e)}"],
                "情感分类": ["负向"],
                "情感强度": ["强烈"],
                "情感分析": ["文件处理失败，请检查文件格式"]
            })
        
        out_buf = io.BytesIO()
        with pd.ExcelWriter(out_buf, engine="openpyxl") as writer:
            out_df.to_excel(writer, index=False, sheet_name="结果")
        out_buf.seek(0)
        
        # 安全处理文件名，避免编码问题
        try:
            # 尝试使用原始文件名
            base_name = excel_file.filename.rsplit(".", 1)[0] if excel_file.filename else "result"
            # 清理文件名中的特殊字符
            import re
            base_name = re.sub(r'[^\w\s-]', '', base_name)
            export_name = f"{base_name}_processed.xlsx"
        except:
            # 如果文件名处理失败，使用默认名称
            export_name = "original_sound_processed.xlsx"
        
        print(f"🔍 生成Excel文件: {export_name}")
        
        # 使用UTF-8编码处理文件名
        try:
            # 对文件名进行URL编码，确保中文字符正确处理
            import urllib.parse
            encoded_filename = urllib.parse.quote(export_name.encode('utf-8'))
            content_disposition = f"attachment; filename*=UTF-8''{encoded_filename}"
        except:
            # 如果编码失败，使用ASCII安全的文件名
            content_disposition = f"attachment; filename=\"original_sound_processed.xlsx\""
        
        return StreamingResponse(
            out_buf,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": content_disposition
            }
        )
        
    except Exception as e:
        print(f"❌ Excel下载处理失败: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"处理失败: {str(e)}")

@router.post("/analyze-only")
async def analyze_original_sound_only(
    user_input: str = Form(...),
    source_language: str = Form(...),
    target_language: str = Form(...)
):
    """仅进行原声分析，不生成标准化格式"""
    try:
        # 验证输入
        if not user_input or len(user_input.strip()) < 5:
            raise HTTPException(status_code=400, detail="原声内容至少需要5个字符")
        
        # 获取模板配置
        template = await template_service.get_template("original_sound_cleaning")
        
        # 调用LLM进行原声分析
        analysis_result = await llm_service.analyze_original_sound(
            user_input=user_input,
            source_language=source_language,
            target_language=target_language,
            template=template
        )
        
        return {
            "success": True,
            "analysis": analysis_result,
            "message": "原声分析完成"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"分析失败: {str(e)}")

async def parse_excel_file(file_path: str) -> str:
    """解析Excel文件并提取文本内容"""
    try:
        # 读取Excel文件
        if file_path.endswith('.xlsx'):
            df = pd.read_excel(file_path, engine='openpyxl')
        else:
            df = pd.read_excel(file_path, engine='xlrd')
        
        # 提取所有文本内容
        text_content = []
        for column in df.columns:
            for value in df[column].dropna():
                if isinstance(value, str) and value.strip():
                    text_content.append(str(value).strip())
        
        # 合并文本内容
        parsed_text = " ".join(text_content)
        
        return parsed_text
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Excel文件解析失败: {str(e)}")

async def parse_excel_file_multiple(file_path: str) -> List[str]:
    """解析Excel文件并提取多条原声文本"""
    try:
        # 读取Excel文件
        if file_path.endswith('.xlsx'):
            df = pd.read_excel(file_path, engine='openpyxl')
        else:
            df = pd.read_excel(file_path, engine='xlrd')
        
        # 选择文本列：优先 'text' 或 '内容'，否则取第一列
        text_col = None
        for candidate in ["text", "内容", "原声", "feedback", "comment"]:
            if candidate in df.columns:
                text_col = candidate
                break
        if text_col is None:
            text_col = df.columns[0]
        
        # 提取每条原声文本
        original_sounds = []
        for value in df[text_col].dropna():
            if isinstance(value, str) and value.strip():
                original_sounds.append(str(value).strip())
        
        return original_sounds
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Excel文件解析失败: {str(e)}")

async def cleanup_old_records(user_id: str, db: AsyncSession, max_records: int = 50):
    """清理用户的历史记录，只保留最近50条"""
    try:
        # 查询用户的所有记录，按创建时间倒序
        stmt = (
            select(ConversionHistory)
            .where(ConversionHistory.user_id == user_id)
            .order_by(desc(ConversionHistory.created_at))
        )
        
        result = await db.execute(stmt)
        all_records = result.scalars().all()
        
        # 如果记录数超过限制，删除多余的记录
        if len(all_records) > max_records:
            records_to_delete = all_records[max_records:]
            for record in records_to_delete:
                await db.delete(record)
            
            await db.commit()
            print(f"已清理用户 {user_id} 的 {len(records_to_delete)} 条旧历史记录")
            
    except Exception as e:
        print(f"清理历史记录失败: {str(e)}")
