import mongoose from "mongoose";
import dbConnect from "./dbConnect";
import User from "../models/User";
import Session from "../models/Session"; // Session schema 
import Account from "../models/Account"; // Account schema 
import VerificationToken from "../models/VerificationToken"; // Verification token schema

const CustomAdapter = () => {
    // Ensure database connection
    dbConnect();

    return {
        // 1. Create a new user in the database
        async createUser(user) {
            try {
                user.username = user.email.split('@')[0];
                const newUser = await User.create(user);
                return newUser.toObject();
            } catch (error) {
                console.error("Error creating user:", error);
                throw new Error("Failed to create user.");
            }
        },

        // 2. Retrieve a user by their unique ID
        async getUser(id) {
            try {
                const user = await User.findById(id).lean();
                return user || null;
            } catch (error) {
                console.error("Error retrieving user:", error);
                return null;
            }
        },

        // 3. Find a user by their email address
        async getUserByEmail(email) {
            try {
                const user = await User.findOne({ email }).lean();
                return user || null;
            } catch (error) {
                console.error("Error retrieving user by email:", error);
                return null;
            }
        },

        // 4. Find a user by provider and providerAccountId
        async getUserByAccount({ provider, providerAccountId }) {
            try {
                const account = await Account.findOne({ provider, providerAccountId });
                if (!account) return null;
                const user = await User.findById(account.userId).lean();
                return user || null;
            } catch (error) {
                console.error("Error retrieving user by account:", error);
                return null;
            }
        },

        // 5. Link a provider account to a user
        async linkAccount(account) {
            try {
                await Account.create(account);
            } catch (error) {
                console.error("Error linking account:", error);
                throw new Error("Failed to link account.");
            }
        },

        // 6. Create a new session for a user
        async createSession(user) {
            const session = new Session({
                userId: user._id, // Link session to the user's ID
                sessionToken: generateSessionToken(), // Your method to create a unique token
                expires: new Date(Date.now() + 60 * 60 * 1000), // Example expiration time (1 hour)
            });

            await session.save();

            return session;
        },

        // 7. Retrieve session and its associated user
        async getSessionAndUser(sessionToken) {
            try {
                // Fetch the session using the sessionToken
                const session = await Session.findOne({ sessionToken }).lean();

                if (!session) {
                    console.error("Session not found for token:", sessionToken);
                    return null;
                }

                // Fetch the user using the userId stored in the session
                const user = await User.findById(session.userId).lean();

                if (!user) {
                    console.error("User not found for session:", sessionToken);
                    return null;
                }

                // Return the session and user
                return { session, user };
            } catch (error) {
                console.error("Error in getSessionAndUser:", error);
                throw new Error("Failed to retrieve session and user.");
            }
        },

        // 8. Update an existing session
        async updateSession(session) {
            try {
                const updatedSession = await Session.findOneAndUpdate(
                    { sessionToken: session.sessionToken },
                    session,
                    { new: true }
                ).lean();

                return updatedSession || null;
            } catch (error) {
                console.error("Error updating session:", error);
                return null;
            }
        },

        // 9. Delete a session by its sessionToken
        async deleteSession(sessionToken) {
            try {
                await Session.deleteOne({ sessionToken });
            } catch (error) {
                console.error("Error deleting session:", error);
                throw new Error("Failed to delete session.");
            }
        },

        // 10. Update a user's details
        async updateUser(user) {
            try {
                const updatedUser = await User.findByIdAndUpdate(user.id, user, {
                    new: true,
                }).lean();

                return updatedUser || null;
            } catch (error) {
                console.error("Error updating user:", error);
                return null;
            }
        },
        async createVerificationToken(token) {
            try {
                const newToken = await VerificationToken.create(token);
                return newToken.toObject();
            } catch (error) {
                console.error("Error creating verification token:", error);
                throw new Error("Failed to create verification token.");
            }
        },

        // 12. Use and invalidate a verification token
        async useVerificationToken({ identifier, token }) {
            try {
                const verificationToken = await VerificationToken.findOneAndDelete({
                    identifier,
                    token,
                }).lean();

                return verificationToken || null;
            } catch (error) {
                console.error("Error using verification token:", error);
                throw new Error("Failed to use verification token.");
            }
        }
    };
};

export default CustomAdapter;
