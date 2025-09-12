import detectPattern from "../utils/Pattern.js";
import { HmpiComputation } from "../utils/HmpiComputation.js";

export const HmpiComputationController = (req,res)=>{
    const data = req.body.data.parsData.Sheet1;
    const standard = req.body.standard;

    let frontEndData = HmpiComputation(data,standard);
    // console.log(frontEndData);

    res.status(200).json(frontEndData);
}