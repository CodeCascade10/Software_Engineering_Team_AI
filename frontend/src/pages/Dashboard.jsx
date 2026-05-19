import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import API from "../api/axios";


export default function Dashboard() {

  const navigate = useNavigate();

  const [user, setUser] = useState(null);


  useEffect(() => {

    const fetchUser = async () => {

      try {

        const res = await API.get(
          "/users/me"
        );

        setUser(res.data.user);

      } catch (err) {

        localStorage.removeItem("token");

        navigate("/");
      }
    };

    fetchUser();

  }, []);


  const logout = () => {

    localStorage.removeItem("token");

    navigate("/");
  };


  return (

    <div className="p-10">

      <div className="flex justify-between items-center">

        <div>

          <h1 className="text-4xl font-bold">
            Dashboard
          </h1>

          {user && (

            <p className="mt-2 text-lg">

              Welcome {user.email}

            </p>
          )}

        </div>

        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>

      </div>

    </div>
  );
}