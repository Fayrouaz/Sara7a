


export const findOne = async ({model , filter = {} , select ="" ,populate=[]} ={})=>{

return await model.findOne(filter).select(select).populate(populate)

}


export const find = async ({model , filter = {} , select ="" ,populate=[]} ={})=>{

return await model.find(filter).select(select).populate(populate)

}


export const findById = async ({model ,id , select ="" ,populate=[]} ={})=>{

return await model.findById(id).select(select).populate(populate)

}




export const create = async ({model ,data=[{}] , options ={ validateBeforeSave : true} } ={})=>{

return await model.create(data , options)

}


export const findOneAndDelete = async ({ model, filter }) => {
    return await model.findOneAndDelete(filter); 
};




export const updateOne = async ({model , filter = {} ,data= {} , options ={ runValidtors :true}} ={})=>{

return await model.updateOne(filter, { $set: data } , options)
}


export const findByIdandUpdate = async ({
  model,
  id = "",
  data = {},
  options = { runValidators: true, new: true }
} = {}) => {
  return await model.findByIdAndUpdate(id, data, options);
};
export const findOneAndUpdate= async ({model , filter={} ,data= {} , options ={ runValidators:true  ,new:true}} ={})=>{

return await model.findOneAndUpdate(filter, data , options)
}

