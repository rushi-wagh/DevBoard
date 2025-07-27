import mongoose,{Schema} from "mongoose"

const projectSchema= new Schema({
    title :{
        type:String,
        required:true,
        unique:true,
        trim: true
    },
    description : {
        type:String,
        required:true, 
        trim: true
    },
    createdBy :{
        type : Schema.Types.ObjectId,
        ref : "User",
        required :true
    }},{timestamps:true})


export const project = mongoose.model("project",projectSchema)