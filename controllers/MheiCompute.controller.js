import { MheiComputation } from "../utils/MheiComputation.js";

export const MheiComputationController = (req,res)=>{
     const data = req.body.data.parsData.Sheet1;
     const standard = req.body.standard;
     
    
        let frontEndData = MheiComputation(data,standard);
        // console.log(frontEndData);

        res.status(200).json(frontEndData);
}