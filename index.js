import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import { passwordDB } from "./constants/db.js";

mongoose
	.connect(
		`mongodb+srv://userExp:${passwordDB}@cluster0.nh0vt.mongodb.net/?retryWrites=true&w=majority`
	)
	.then(() => console.log("DB OK"))
	.catch((err) => console.log("Error"));

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.post("/auth/register", (req, res) => {
	const token = jwt.sign(
		{
			pass: req.body.pass,
			test: 421,
		},
		"secret123"
	);

	res.json({
		test: 323,
		token,
	});
});

app.listen(3000, (err) => {
	if (err) {
		alert(err);
		console.log(err);
	}

	console.log("Server is running");
});
