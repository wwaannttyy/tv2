
import logging
from aiogram import Bot, Dispatcher, types
from aiogram.types import WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup
from aiogram.filters import Command
from aiogram.fsm.storage.memory import MemoryStorage
import asyncio

API_TOKEN = '6806763498:AAFwMezfsApK3Tlxt-tD8WJy1-tK8j4OwDU'

logging.basicConfig(level=logging.INFO)

bot = Bot(token=API_TOKEN)
storage = MemoryStorage()
dp = Dispatcher(storage=storage)

async def send_welcome(message: types.Message):
    web_app_url = f"https://1bd8-89-23-122-224.ngrok-free.app/?user_id={message.from_user.id}"
    web_app_button = InlineKeyboardButton(text="Open WebApp", web_app=WebAppInfo(url=web_app_url))
    keyboard = InlineKeyboardMarkup(inline_keyboard=[[web_app_button]])
    await message.answer("Welcome! Click the button below to start the game.", reply_markup=keyboard)

async def main():
    dp.message.register(send_welcome, Command("start"))
    await dp.start_polling(bot)

if __name__ == '__main__':
    asyncio.run(main())

