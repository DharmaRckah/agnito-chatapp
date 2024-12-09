import userModel from "../models/userModel.js";

export const getAlluserController = async (req, res) => {
  try {
    const users = await userModel.find().select("-password");

    if (users.length > 0) {
      return res.status(200).send({
        success: true,
        message: "Users retrieved successfully",
        users,
      });
    } else {
      return res.status(404).send({
        success: false,
        message: "No users found",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "An error occurred while retrieving users",
      error: error.message,
    });
  }
};
