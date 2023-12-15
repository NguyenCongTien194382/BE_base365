const DeKt = require('../../../models/DanhGiaNangLuc/DeKiemTraCauHoi');
const functions = require('../../../services/functions');

// Get test data for DeKiemTraCauHoi
// exports.getTest = async (req, res, next) => {
//     try {
//         // Get the user type from the request
//         const userType = req.user.data.type;

//         // Define a filter object for the query
//         const filter = {};

//         if (userType === 1) {
//             // If the user type is 1, it means they are a company, so use their _id
//             filter.id_congty = req.user.data._id;
//         } else {
//             // If the user type is not 1, assume it's another value like 2
//             // In this case, use com_id from the user data
//             filter.id_congty = req.user.data.com_id;
//         }

//         // Query the DeKt model using the filter and is_delete condition
//         const DeKtName = await DeKt.find({ ...filter, is_delete: 2 });

//         // Calculate the length of the result array
//         const DeKtNameLength = DeKtName.length;

//         return functions.success(res, 'Successfully', { data: DeKtName, length: DeKtNameLength });
//     } catch (error) {
//         console.error(error);
//         return functions.setError(res, 'Internal Server Error', 500);
//     }
// };


exports.test = async(req,res,next) =>{
    try{
        /// lay id cong ty
        const type = req.user.data.type


        const tokenData = { id_congty: 0 }; // Define usc_id as needed
        if (type === 1) {
            tokenData.id_congty = req.user.data._id
        }
        else {
            tokenData.id_congty = req.user.data.com_id
        }
        console.log(tokenData.id_congty)
        // const DeKtName = await DeKt.find({isdelete}, {is_delete:1, id:1})
        const DeKtName = await DeKt.aggregate(
            [
                {
                    $match: {id_congty: tokenData.id_congty}
                },
                {$project:{
                    id:1,
                    is_delete:1,
                }}
            ])
        return functions.success(res,'Successfully',DeKtName)
    }
    catch(error){
        console.log(error)
        return functions.setError(res,'Internal Server',500)
    }
}


