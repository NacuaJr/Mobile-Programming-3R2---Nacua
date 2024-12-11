const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());
import { supabase } from '../utils/supabase';
// Fetch random user and update the `users` table
app.post('/add-profile-picture', async (req, res) => {
    const { userId } = req.body; // Expecting `userId` in the request body

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required.' });
    }

    try {
        // Fetch a random user from the API
        const response = await axios.get('https://randomuser.me/api/');
        const profilePictureUrl = response.data.results[0].picture.large;

        // Update the user's profile_picture in the database
        const { error } = await supabase
            .from('users')
            .update({ profile_picture: profilePictureUrl })
            .eq('id', userId);

        if (error) {
            console.error('Database Error:', error.message);
            return res.status(500).json({ error: 'Failed to update profile picture.' });
        }

        res.json({ message: 'Profile picture added successfully!', profilePictureUrl });
    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).json({ error: 'Failed to fetch profile picture.' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
