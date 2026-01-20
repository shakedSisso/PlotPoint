import { User } from "../models/user.model.js";
import { DeleteUser } from "../validations/upadate.schema.js";

export async function getUsers(req, res) {
    try {
        const users = await User.find({}, "-password -isAdmin -createdAt -updatedAt"); 
        res.status(200).json({ success: true, users });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: "Server error" });
    }
}


export async function deleteUser(req, res) {
  try {
    const { userId } = DeleteUser.parse(req.params);

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (err) {
    if (err.name === "ZodError") {
      const errors = err.issues.map(e => `${e.path.join(".")}: ${e.message}`);
      return res.status(400).json({ success: false, errors });
    }

    console.log(err);
    res.status(500).json({ success: false, error: "Server error" });
  }
}
