import dbConnect from "../../../_lib/dbConnect";
import User from "../../../models/User";

export async function checkEmail(email) {
    try {
        await dbConnect();
        const user = User.findOne({ email: email })
        return !!user;
    } catch (error) {
        console.log(error)
        throw new Error('Failed to check email');
    }
}