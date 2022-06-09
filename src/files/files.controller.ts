export async function uploadFile(req: any, res: any): Promise<Response> {
    const fileUrl =  req.file.url
    try{              
    
        return  res.status(201).send(            
               {  
                   status:200,
                   message:"File uploaded successfully ",
                   fileUrl:  fileUrl
               }
           )

   }catch(err){
       console.log(err)
      return res.status(500).send({status:500, message:"Error while uploading file "})
   }
      
  
}


