import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../providers/AuthProvider";
import axios from "axios";
import BidsTableRows from "../components/BidsTableRows";
import toast from "react-hot-toast";
import useAxiosSecure from "../components/hooks/axios-intense/axiosSecure";


const MyBids = () => {
  // 
  const axiosSecure = useAxiosSecure()
  const { user } = useContext(AuthContext);
  // 
  const [userBids, setUserBids] = useState();
  // fetch specific user added jobs by axios
  const fetchBids = async () => {
    // using custom axios
    const { data } = await axiosSecure.get(
      `/my-bids/${user?.email}`
    );
    setUserBids(data);
  };
  //
  useEffect(() => {
    fetchBids();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // 
    // hnadle status changes
    const handleStatus= async(id,prevStatus, status)=>{
      // 
      if(prevStatus !== 'In Progress'){
        return console.log('not allowed')
      }
      try{
        await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/bid-status-update/${id}`, {status}
      );
      toast.success("Status Updated");
      fetchBids()
    }catch(err){
         console.log(err)
    }
  }
  // 
  return (
    <section className="container px-4 mx-auto my-12">
      <div className="flex items-center gap-x-3">
        <h2 className="text-lg font-medium text-gray-800 ">My Bids</h2>

        <span className="px-3 py-1 text-xs text-blue-600 bg-blue-100 rounded-full ">
         {userBids?.length} Bid
        </span>
      </div>

      <div className="flex flex-col mt-6">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden border border-gray-200  md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 px-4 text-sm font-normal text-left rtl:text-right text-gray-500"
                    >
                      <div className="flex items-center gap-x-3">
                        <span>Title</span>
                      </div>
                    </th>

                    <th
                      scope="col"
                      className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500"
                    >
                      <span>Deadline</span>
                    </th>

                    <th
                      scope="col"
                      className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500"
                    >
                      <button className="flex items-center gap-x-2">
                        <span>Price</span>
                      </button>
                    </th>

                    <th
                      scope="col"
                      className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500"
                    >
                      Category
                    </th>

                    <th
                      scope="col"
                      className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500"
                    >
                      Status
                    </th>

                    <th className="px-4 py-3.5 text-sm font-normal text-left rtl:text-right text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                {userBids?.map(bid=> <BidsTableRows key={bid._id} bids={bid} handleStatus={handleStatus}/>)}
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MyBids;
