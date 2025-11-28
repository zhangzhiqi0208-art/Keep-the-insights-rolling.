# API package
from fastapi import APIRouter
from . import analysis, files, fill_template, prompts, templates, history, original_sound, title_generation, problem_description, smart_fill_problem

# 创建主API路由器
api_router = APIRouter()

# 注册各个模块的路由
api_router.include_router(analysis.router)
api_router.include_router(files.router)
api_router.include_router(fill_template.router)
api_router.include_router(prompts.router)
api_router.include_router(templates.router)
api_router.include_router(history.router)
api_router.include_router(original_sound.router)
api_router.include_router(title_generation.router)
api_router.include_router(problem_description.router)
api_router.include_router(smart_fill_problem.router)
