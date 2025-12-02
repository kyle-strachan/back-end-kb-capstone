import Log from "../models/log.js";

export default async function logEvent(eventDescription, user) {
  try {
    await Log.create({
      eventDescription,
      user,
    });
  } catch (error) {
    console.log(`Log unavailable ${eventDescription}, ${user}`);
  }
}
