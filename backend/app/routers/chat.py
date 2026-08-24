from fastapi import APIRouter, HTTPException, Path
from typing import List
from app.schemas.chat import ChatMessageCreate, ChatMessageResponse
from app.services.supabase_service import SupabaseService

router = APIRouter(prefix="/orders/{order_id}/messages", tags=["Deal Live Chat"])

@router.get("", response_model=List[ChatMessageResponse])
async def get_order_messages(order_id: str = Path(..., description="Order ID")):
    """
    Retrieves all chat messages and system logs for a specific deal.
    """
    order = await SupabaseService.get_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден.")
    
    actual_order_id = order["id"]
    messages = await SupabaseService.get_messages(actual_order_id)
    return messages

@router.post("", response_model=ChatMessageResponse)
async def post_order_message(
    order_id: str,
    req: ChatMessageCreate
):
    """
    Sends a new message in the deal chat (supports text & receipt image attachments).
    """
    order = await SupabaseService.get_order_by_id(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден.")

    actual_order_id = order["id"]
    msg = await SupabaseService.add_message(
        order_id=actual_order_id,
        sender_type=req.sender_type.value,
        sender_name=req.sender_name,
        message=req.message,
        attachment_url=req.attachment_url
    )
    return msg
