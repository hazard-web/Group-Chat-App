const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");

const cors = require("cors");
app.use(
  cors({
    origin: "*",
  })
);

const dotenv = require("dotenv");
dotenv.config();

const sequelize = require("./util/database");

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


const userRouter = require("./router/userRouter");
const homePageRouter = require("./router/homePageRouter");
const chatRouter = require("./router/chatRouter");
const groupRouter = require("./router/groupRouter");


const User = require("./models/userModel");
const Chat = require("./models/chatModel");
const Group = require("./models/groupModel");
const UserGroup = require("./models/userGroup");

User.hasMany(Chat, { onDelete: "CASCADE", hooks: true });
Chat.belongsTo(User);
Chat.belongsTo(Group);

User.hasMany(UserGroup);

Group.hasMany(Chat);
Group.hasMany(UserGroup);

UserGroup.belongsTo(User);
UserGroup.belongsTo(Group);

app.use("/", userRouter);
app.use("/user", userRouter);
app.use("/homePage", homePageRouter);
app.use("/chat", chatRouter);
app.use("/group", groupRouter);

sequelize
  .sync({alter: true})
  .then((result) => {
    console.log('Model synced successfully');
    app.listen(process.env.PORT || 3000);
  })
  .catch(err => {
    console.log('Error syncing models', err);
  });
