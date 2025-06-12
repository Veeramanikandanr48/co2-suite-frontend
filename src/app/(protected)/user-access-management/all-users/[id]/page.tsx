const UserPage = ({ params }: { params: Promise<{ id: string }> }) => {
    console.log(params, "params")

    return (
        <h1>Create User</h1>
    )

};

export default UserPage;