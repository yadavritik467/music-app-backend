export const removeVisitedUserById = async (id, userId) => {
    try {
        const allDetails = await User.findById(id);
        const updatedVisited = allDetails.visited.pull(userId);
        allDetails.visited = updatedVisited;
        await allDetails.save();
    } catch (error) {
        console.error(error);
    }
};