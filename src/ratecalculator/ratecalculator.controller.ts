
import { Ratecalculatorcategory } from './ratecalculator.category.model';
import { Ratecalculatorsubcategory } from './ratecalculator.subcategory.model';


// Find all category
  export async function getAllGiftcardCategory (req: any, res: any): Promise<Response> {
    try{
            const findAllCategories = await Ratecalculatorcategory.find().sort({"_id": 1})    
            return  res.status(200).send({ status: 200, message: findAllCategories})
        
       }catch(err){
           console.log(err)
           return res.status(500).send({ status: 500, message:"Error while getting all categories "})
       }
};

// Find subcategory by category id 
   export async function getGiftcardSubCategoryByCategoryId (req: any, res: any): Promise<Response> {
    try{
         let id = req.params.id
         const findsubcategoryByCategoryId = await Ratecalculatorsubcategory.find({categoryId: id})
        
         return  res.status(200).send({status: 200, message: findsubcategoryByCategoryId})
            
        }catch(err){
            console.log(err)
            return res.status(500).send({status: 500, message:"Error while getting sub category "})
        }
 
 };

 // Find all sub category
    export async function getAllGiftcardSubCategory (req: any, res: any): Promise<Response> {
    try{
            const findAllSubCategories = await Ratecalculatorsubcategory.find().sort({"_id": 1})    
            return res.status(200).send({ status: 200, message: findAllSubCategories})
        
       }catch(err){
           console.log(err)
           return res.status(500).send({status: 500, message:"Error while getting all sub categories "})
       }
};

// Update  subcategory
export async function updateGiftcardSubCategory (req: any, res: any): Promise<Response> {
    const _id = req.params.id;
    const { categoryname,categoryId,subcategoryname,termsandconditions,nairarate,btcrate, cardapproveltime, minimumAmount, maximumAmount } = req.body;
     
            const subcategory = new Ratecalculatorsubcategory({
                _id : _id,
                categoryname: categoryname,
                categoryId: categoryId,
                subcategoryname: subcategoryname,
                termsandconditions:termsandconditions,
                nairarate: nairarate,
                btcrate: btcrate,
                cardapproveltime: cardapproveltime,
                minimumAmount: minimumAmount ,
                maximumAmount: maximumAmount
                
              });
         
            try{
                const updateProfile = await Ratecalculatorsubcategory.updateOne( {_id}, subcategory)                     
                return res.status(200).send({status: 200, message:" Subcategory updated succesfully"})
            }catch(err){
                console.log(err)
               return res.status(500).send({status: 500, message:"Error while updating Subcategory "})
            }
                   
}

// create  subcategory
export async function createGiftcardSubCategory (req: any, res: any): Promise<Response> {
    const { categoryname,categoryId,subcategoryname,termsandconditions,nairarate,btcrate, cardapproveltime, minimumAmount, maximumAmount } = req.body;
    try{
        const findCategory = await Ratecalculatorcategory.findOne({categoryname : categoryname}).sort({"_id": 1}) 
        console.log(findCategory)
        if (!findCategory && categoryId === "" ){
            const category = new Ratecalculatorcategory({              
                categoryname: categoryname,                  
            });

                const savecategory = await  category.save()
                console.log(savecategory)
                const subcategory = new Ratecalculatorsubcategory({
            
                categoryname: categoryname,
                categoryId: savecategory._id,
                subcategoryname: subcategoryname,
                termsandconditions:termsandconditions,
                nairarate: nairarate,
                btcrate: btcrate,
                cardapproveltime: cardapproveltime,
                minimumAmount: minimumAmount ,
                maximumAmount: maximumAmount
                
                });
                const saveSubCategory = await subcategory.save()                 
                return res.status(201).send({ status: 201, message:" Created succesfully"})
        }else{
            const subcategory = new Ratecalculatorsubcategory({
            
                categoryname: categoryname,
                categoryId: categoryId,
                subcategoryname: subcategoryname,
                termsandconditions:termsandconditions,
                nairarate: nairarate,
                btcrate: btcrate,
                cardapproveltime: cardapproveltime,
                minimumAmount: minimumAmount ,
                maximumAmount: maximumAmount
                
                });
                const saveSubCategory = await subcategory.save()               
                return res.status(201).send({ status: 201, message:"Created succesfully"})
        }        
    }catch(err){
        console.log(err)
        return res.status(500).send({status: 500, message:"Error while updating Subcategory "})
    }
                
}

// delete sub category
export async function deleteGiftcardSubCategory (req: any, res: any): Promise<Response> {
    try{
        const id = req.params.id;
        const categoryId  = req.query.categoryId;
      
        const findsubcategoryByCategoryId = await Ratecalculatorsubcategory.find({categoryId: categoryId});
             if(findsubcategoryByCategoryId.length === 1 ){
                const deleteCategory= await Ratecalculatorcategory.findByIdAndRemove(categoryId)
                const deletaSubcategory= await Ratecalculatorsubcategory.findByIdAndRemove(id)
             }else{
                const deletaSubcategory= await Ratecalculatorsubcategory.findByIdAndRemove(id)
             }
        return res.status(200).send({status: 200, message:"Deleted succesfully"})
         
       }catch(err){
           console.log(err)
           return  res.status(500).send({ status: 500, message:"Error while deleting sub category "})
       }
}



export async function createGiftCardCategory (req: any, res: any): Promise<Response> {
    
    const {data} = req.body;
  
    if ( data ){
          if (  data.length=== 0  ){
           return  res.status(400).send({
                 status: 400,
                message:"Incorrect entry format5"
            });
        }else{
           
                  
           
            
            try{
                for( var i = 0; i < data.length; i++){
                    const ratecalculatorcategory = new Ratecalculatorcategory({
                
                        categoryname: data[i].categoryname
                      });
                     
                      const save = await  ratecalculatorcategory.save()
                
                  }                 
                  return res.status(201).send({ status: 201, message:"saved successfully "})
                
                
            }catch(err){
                console.log(err)
                return res.status(500).send({ status: 500, message:"Error while saving "})
            }
          
          
   
          
        }
    }else{
        return res.status(400).send({
            status: 400,
            message:"Incorrect entry format6"
        });
    }
                   
};

export async function deleteGiftcardCategory (req: any, res: any): Promise<Response> {
    try{

        const categoryId = req.params.id;
        // const sess = await mongoose.startSession()
        // sess.startTransaction()
        const deleteCategory= await Ratecalculatorcategory.findByIdAndRemove(categoryId)
        const deleteSubCategory= await Ratecalculatorsubcategory.deleteMany({categoryId: categoryId} )
        // await sess.commitTransaction()
        // sess.endSession();   
        //console.log(deletaOffice)
        return res.status(200).send({status: 200, message:"Deleted succesfully"})
         
       }catch(err){
           console.log(err)
           return res.status(500).send({status: 500, message:"Error while deleting category"})
       }
}

    export async function createAllsubCategory (req: any, res: any): Promise<Response> {
    
    console.log(req.body)

    const { categoryname, categoryId, data} = req.body;
  
    if ( data ){
          if (  data.length=== 0  ){
            return  res.status(400).send({
                message:"Incorrect entry format5"
            });
        }else{
           
                  
           
            
            try{
                for( var i = 0; i < data.length; i++){
                    const ratecalculator = new Ratecalculatorsubcategory({
                        categoryname: data[i].categoryname,
                        categoryId: data[i].categoryId,
                        subcategoryname: data[i].subcategoryname,
                        termsandconditions: data[i].termsandconditions,
                        nairarate: data[i].nairarate,
                        btcrate: data[i].btcrate,
                        cardapproveltime: data[i].cardapproveltime,
                        minimumAmount: data[i].minimumAmount,
                        maximumAmount: data[i].maximumAmount
                    });
                     
                      const save = await  ratecalculator.save()
                  
                
                  }                 
                  return res.status(201).send({message:"saved successfully "})
                
                
            }catch(err){
                console.log(err)
              return  res.status(500).send({message:"Error while saving "})
            }
          
          
   
          
        }
    }else{
        return res.status(400).send({
            message:"Incorrect entry format6"
        });
    }
                   
};
