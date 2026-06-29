// import { auth } from "../firebase/firebase";

// const API_BASE_URL = "http://localhost:5000/api";

// // ============================================
// // GET USER LIBRARY
// // ============================================
// export const getLibrary = async () => {
//   if (!auth.currentUser) {
//     throw new Error("User not authenticated");
//   }

//   try {
//     const uid = auth.currentUser.uid;
//     const response = await fetch(`${API_BASE_URL}/library/${uid}`);
    
//     if (!response.ok) {
//       throw new Error(`Failed to fetch library: ${response.statusText}`);
//     }

//     const data = await response.json();
    
//     if (Array.isArray(data)) return data;
//     if (Array.isArray(data?.library)) return data.library;
//     if (Array.isArray(data?.data)) return data.data;
    
//     return [];
//   } catch (error) {
//     console.error("Error fetching library:", error);
//     throw error;
//   }
// };

// // Backward compatibility alias
// export const getUserLibrary = getLibrary;

// // ============================================
// // SAVE / UPDATE LIBRARY ITEM
// // ============================================
// export const saveLibraryItem = async (item) => {
//   if (!auth.currentUser) {
//     throw new Error("User not authenticated");
//   }

//   try {
//     const uid = auth.currentUser.uid;
    
//     const payload = {
//       ...item,
//       firebaseUid: uid,
//       tmdbId: item.tmdbId || item.id,
//     };

//     const response = await fetch(`${API_BASE_URL}/library/save`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(payload),
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to save item: ${response.statusText}`);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Error saving library item:", error);
//     throw error;
//   }
// };

// // Bulk save
// export const saveLibrary = async (items) => {
//   if (!auth.currentUser) {
//     throw new Error("User not authenticated");
//   }

//   try {
//     const uid = auth.currentUser.uid;
    
//     for (const item of items) {
//       const payload = {
//         ...item,
//         firebaseUid: uid,
//         tmdbId: item.tmdbId || item.id,
//       };

//       await fetch(`${API_BASE_URL}/library/save`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//       });
//     }

//     return { success: true };
//   } catch (error) {
//     console.error("Error saving library:", error);
//     throw error;
//   }
// };

// // ============================================
// // DELETE FROM LIBRARY
// // ============================================
// export const deleteLibraryItem = async (tmdbId) => {
//   if (!auth.currentUser) {
//     throw new Error("User not authenticated");
//   }

//   try {
//     const uid = auth.currentUser.uid;

//     const response = await fetch(`${API_BASE_URL}/library/delete/${uid}/${tmdbId}`, {
//       method: "DELETE",
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to delete item: ${response.statusText}`);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Error deleting library item:", error);
//     throw error;
//   }
// };

// // ============================================
// // UPDATE STATUS
// // ============================================
// export const updateStatus = async (tmdbId, status) => {
//   if (!auth.currentUser) {
//     throw new Error("User not authenticated");
//   }

//   try {
//     const uid = auth.currentUser.uid;

//     const response = await fetch(`${API_BASE_URL}/library/status/${uid}/${tmdbId}`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ status }),
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to update status: ${response.statusText}`);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Error updating status:", error);
//     throw error;
//   }
// };

// // ============================================
// // UPDATE RATING & REVIEW
// // ============================================
// export const updateRating = async (tmdbId, rating, userReview = "") => {
//   if (!auth.currentUser) {
//     throw new Error("User not authenticated");
//   }

//   try {
//     const uid = auth.currentUser.uid;

//     const response = await fetch(`${API_BASE_URL}/library/rating/${uid}/${tmdbId}`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ rating, userReview }),
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to update rating: ${response.statusText}`);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Error updating rating:", error);
//     throw error;
//   }
// };

// // ============================================
// // TOGGLE FAVORITE
// // ============================================
// export const toggleFavorite = async (tmdbId) => {
//   if (!auth.currentUser) {
//     throw new Error("User not authenticated");
//   }

//   try {
//     const uid = auth.currentUser.uid;

//     const response = await fetch(`${API_BASE_URL}/library/favorite/${uid}/${tmdbId}`, {
//       method: "PUT",
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to toggle favorite: ${response.statusText}`);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Error toggling favorite:", error);
//     throw error;
//   }
// };

// // ============================================
// // UPDATE SENTIMENT
// // ============================================
// export const updateSentiment = async (tmdbId, sentiment) => {
//   if (!auth.currentUser) {
//     throw new Error("User not authenticated");
//   }

//   try {
//     const uid = auth.currentUser.uid;

//     const response = await fetch(`${API_BASE_URL}/library/sentiment/${uid}/${tmdbId}`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ sentiment }),
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to update sentiment: ${response.statusText}`);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Error updating sentiment:", error);
//     throw error;
//   }
// };

// // ============================================
// // UPDATE EPISODE PROGRESS
// // ============================================
// export const updateEpisodeProgress = async (
//   tmdbId,
//   season,
//   episode,
//   watchedAt = new Date().toISOString()
// ) => {
//   if (!auth.currentUser) {
//     throw new Error("User not authenticated");
//   }

//   try {
//     const uid = auth.currentUser.uid;

//     const response = await fetch(
//       `${API_BASE_URL}/library/episode-progress/${uid}/${tmdbId}`,
//       {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           season,
//           episode,
//           watchedAt,
//         }),
//       }
//     );

//     if (!response.ok) {
//       throw new Error(`Failed to update episode: ${response.statusText}`);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Error updating episode progress:", error);
//     throw error;
//   }
// };

// // ============================================
// // UPDATE WATCH HISTORY
// // ============================================
// export const updateWatchHistory = async (tmdbId, watchEntry) => {
//   if (!auth.currentUser) {
//     throw new Error("User not authenticated");
//   }

//   try {
//     const uid = auth.currentUser.uid;

//     const response = await fetch(
//       `${API_BASE_URL}/library/watch-history/${uid}/${tmdbId}`,
//       {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           watchEntry: {
//             ...watchEntry,
//             watchedAt: watchEntry.watchedAt || new Date().toISOString(),
//           },
//         }),
//       }
//     );

//     if (!response.ok) {
//       throw new Error(`Failed to update watch history: ${response.statusText}`);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Error updating watch history:", error);
//     throw error;
//   }
// };
// // ============================================
// // SYNC USER WITH BACKEND
// // ============================================
// export const syncUser = async (user) => {
//   try {
//     const response = await fetch(`${API_BASE_URL}/users/sync`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         firebaseUid: user.uid,
//         name: user.displayName || "",
//         email: user.email || "",
//         photoURL: user.photoURL || "",
//       }),
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to sync user: ${response.statusText}`);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("Error syncing user:", error);
//     throw error;
//   }
// };


const API_URL =
"http://localhost:5000/api";

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