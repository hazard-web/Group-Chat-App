const path = require("path");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const Group = require("../models/groupModel");
const sequelize = require("../util/database");
const { Op } = require("sequelize");

const io = require("socket.io")(5000, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.on("getMessages", async (groupName) => {
    try {
      const group = await Group.findOne({ where: { name: groupName } });
      const messages = await Chat.findAll({
        where: { groupId: group.dataValues.id },
      });
      console.log("Request Made");
      io.emit("messages", messages);
    } catch (error) {
      console.log(error);
    }
  });
});
exports.sendMessage = async (req, res, next) => {
  try {

    console.log('Request body:', req.body);  // Log request body
    console.log('Authenticated user:', req.user);  // Log authenticated user details

    // Validate input
    if (!req.body.groupName || !req.body.message.trim()) {
      console.log("Missing groupName or message");
      return res.status(400).json({ message: "Group name and message are required and cannot be empty." });
    }

    // Find the group by its name  
    const group = await Group.findOne({
      where: { name: req.body.groupName }
    });

    console.log('Group Found:', group);
    console.log('User info:', req.user);

    await Chat.create({
      name: req.user.name,
      message: req.body.message,
      userId: req.user.id,
      groupId: group.dataValues.id,
    });
    return res.status(200).json({ message: "Success!" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Error" });
  }
};

// exports.getMessages = async (req, res, next) => {
//   try {
//     const param = req.query.param;
    
//     const group = await Group.findOne({
//       where: { name: req.query.groupName }
//     });
//     const messages = await Chat.findAll({
//       where: {
//         [Op.and]: {
//           id: {
//             [Op.gt]: param,
//           },
//           groupId: group.dataValues.id,
//         },
//       },
//     });
//     return res.status(200).json({ messages: messages });
//   } catch (error) {
//     console.log(error);
//   }
// };