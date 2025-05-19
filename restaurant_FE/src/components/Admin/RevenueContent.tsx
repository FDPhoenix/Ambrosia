import { useState, useEffect } from "react"
import axios from "axios"
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts"
import OrdersList from "../OrdersList"
function RevenueContent() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [revenueData, setRevenueData] = useState<{ day: number; revenue: number }[]>([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  useEffect(() => {
    fetchRevenue()
  }, [year, month])

  const fetchRevenue = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`http://localhost:3000/api/revenue?year=${year}&month=${month}`)
      setRevenueData(response.data.revenueList)
      setTotalRevenue(response.data.totalRevenue)
    } catch (error) {
      console.error("Error fetching revenue data:", error)
    }
    setLoading(false)
  }

  const handleBarClick = (data: { day: number }) => {
    setSelectedDay(data.day)
  }

  const handleDownloadReport = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`http://localhost:3000/api/revenue/export-revenue?year=${year}&month=${month}`, {
        responseType: "blob",
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `Revenue_${year}_${month}.xlsx`)
      document.body.appendChild(link)
      link.click()

      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading report:", error)
    }
    setLoading(false)
  }

  return (
    <div className="w-[730px] p-5 bg-white shadow-md rounded-[15px] h-[567px]">
      {selectedDay === null ? (
        <>
          <h2 className="text-center text-2xl text-gray-800 mb-5">Revenue Chart</h2>
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-1.5">
              <label className="flex items-center">
                Year:
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="ml-2.5 p-1.5 border border-gray-300 rounded-md w-20"
                />
              </label>
              <label className="flex items-center ml-1.5">
                Month:
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="ml-2.5 p-1.5 border border-gray-300 rounded-md w-20"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button
              onClick={handleDownloadReport}
              className="py-2 px-3 bg-amber-400 text-black border-none rounded-md cursor-pointer transition-colors duration-300 hover:bg-amber-500 disabled:bg-gray-300"
              disabled={loading}
            >
              {loading ? "Downloading..." : "Download Report"}
            </button>
          </div>

          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                className="cursor-pointer"
                data={revenueData}
                margin={{ top: 20, right: 30, left: 40, bottom: 30 }}
                onClick={(e) => {
                  if (e && e.activePayload) {
                    const clickedData = e.activePayload[0].payload
                    console.log("Clicked on:", clickedData)
                    handleBarClick(clickedData)
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="day"
                  label={{
                    value: "Day",
                    position: "insideBottom",
                    offset: -10,
                  }}
                />
                <YAxis
                  tickFormatter={(value) => value.toLocaleString("vi-VN")}
                  label={{
                    value: "Revenue (VND)",
                    angle: -90,
                    position: "insideLeft",
                    offset: -25,
                  }}
                />
                <Tooltip formatter={(value) => `${value.toLocaleString("vi-VN")} VND`} />
                <Bar dataKey="revenue" fill="#574ef7" barSize={40} minPointSize={10} cursor="pointer" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-1 text-lg text-right font-bold text-gray-800">
            <strong>Total Revenue:</strong> {totalRevenue.toLocaleString("vi-VN")} VND
          </div>
        </>
      ) : (
        <OrdersList year={year} month={month} day={selectedDay} goBack={() => setSelectedDay(null)} />
      )}
    </div>
  )
}

export default RevenueContent
