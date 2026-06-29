const API_URL =
"https://watchverse-twq7.onrender.com";

export const syncUser =
async (user) => {

  const response =
  await fetch(
    `${API_URL}/users/sync`,
    {
      method: "POST",

      headers: {
        "Content-Type":
        "application/json",
      },

      body: JSON.stringify({
        firebaseUid: user.uid,
        name:
          user.displayName || "",
        email:
          user.email || "",
        photoURL:
          user.photoURL || "",
      }),
    }
  );

  return response.json();
};

export const saveLibraryItem =
async (item) => {

const response =
await fetch(
`${API_URL}/library/save`,
{
method: "POST",

headers: {
"Content-Type":
"application/json",
},

body: JSON.stringify(item),
}
);

return response.json();

};


// export const getUserLibrary = async (uid) => {
//   try {
//     const res = await fetch(`${API_URL}/library/${uid}`);
//     const data = await res.json();

//     if (Array.isArray(data)) return data;
//     if (Array.isArray(data?.library)) return data.library;
//     if (Array.isArray(data?.data)) return data.data;

//     return [];
//   } catch (err) {
//     console.log("getUserLibrary error:", err);
//     return [];
//   }
// };

export const getUserLibrary = async (uid) => {
  const res = await fetch(`${API_URL}/library/${uid}`);
  const data = await res.json();

  return (
    Array.isArray(data)
      ? data
      : Array.isArray(data?.library)
      ? data.library
      : Array.isArray(data?.data)
      ? data.data
      : []
  );
};