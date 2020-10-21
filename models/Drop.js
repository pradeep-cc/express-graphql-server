import mongoose from 'mongoose';


export const Drop = mongoose.model('Drop', {
    text: String
})