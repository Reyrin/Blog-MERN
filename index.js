import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";

import { passwordDB } from "./constants/db.js";
import { registerValidation } from "./validations/auth.js";
import UserModel from "./models/User.js";
import jwt from "jsonwebtoken";

mongoose
	.connect(
		`mongodb+srv://userExp:${passwordDB}@cluster0.nh0vt.mongodb.net/blog?retryWrites=true&w=majority`
	)
	.then(() => console.log("DB OK"))
	.catch((err) => console.log("Error"));

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.post("/auth/register", registerValidation, async (req, res) => {
	try {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			console.log("Error");
			res.status(400).json(errors.array());
		}

		const password = req.body.password;
		const salt = await bcrypt.genSalt(10);
		const hash = await bcrypt.hash(password, salt);

		const doc = new UserModel({
			fullName: req.body.fullName,
			email: req.body.email,
			passwordHash: hash,
			avatarUrl: req.body.avatarUrl,
		});

		const user = await doc.save();
		const token = jwt.sign(
			{
				_id: user._id,
			},
			"secret123",
			{
				expiresIn: "30d",
			}
		);

		const { passwordHash, ...userData } = user._doc;

		res.json({
			...userData,
			token,
		});
	} catch (error) {
		res.status(500).json(error);
	}
});

app.post("/auth/login", async (req, res) => {
	try {
		const user = await UserModel.findOne({ email: req.body.email });

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const isValidPass = await bcrypt.compare(
			req.body.password,
			user._doc.passwordHash
		);

		if (!isValidPass) {
			return res
				.status(400)
				.json({ message: "Invalid login or password" });
		}

		const token = jwt.sign(
			{
				_id: user._id,
			},
			"secret123",
			{
				expiresIn: "30d",
			}
		);

		const { passwordHash, ...userData } = user._doc;

		res.json({
			...userData,
			token,
		});
	} catch {
		res.status(500).json(error);
	}
});

app.listen(3000, (err) => {
	if (err) {
		console.log(err);
	}

	console.log("Server is running");
});
