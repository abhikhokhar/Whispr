'use client'

import { message } from "@/model/User"
import { ApiResponse } from "@/types/ApiResponse";
import axios from "axios";
import { toast } from "sonner"


type MessageCardProps = {
    message: message;
    onMessageDelete: (messageId: string) => void;
}

const MessageCard = ({ message, onMessageDelete }: MessageCardProps): React.ReactNode => {
    const handleDeleteConfirm = async()=>{
        const response = await axios.delete<ApiResponse>(`/api/delete-message/${message._id}`)
        toast.success(response.data.message)
        onMessageDelete(message._id.toString())
    }
    return(
        <div></div>
    )
}
export default MessageCard