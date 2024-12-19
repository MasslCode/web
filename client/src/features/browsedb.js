/* eslint-disable no-unused-vars */
import pkg from 'pg';
import { pool } from "../servers/dbserver.js"

export const handleInputText = async (text) => {
    console.log("Text received: ", text);
    const query= `
        SELECT * FROM albums;`;

    try 
    {
       const result = await pool.query(query);
       console.log(result);
    } catch (err) 
    {
       console.error("There was an error displaying db data.")
    }
}