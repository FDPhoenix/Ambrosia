import type React from "react"
import { useEffect, useState } from "react"
import axios from "axios"
import { Line, Bar } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import annotationPlugin from "chartjs-plugin-annotation"
import { FaUser, FaUserShield, FaUserTie, FaUserFriends, FaUtensils } from "react-icons/fa"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin,
)

interface UserCounts {
  totalUsers: number
  adminCount: number
  customerCount: number
  staffCount: number
  chefCount: number
}

interface LineChartData {
  months: number[]
  subscribers: number[]
  year: number
}

interface BarChartData {
  days: number[]
  subscribers: number[]
  year: number
  month: number
}

const StatisticUser: React.FC = () => {
  const currentDate = new Date()
  const [userCounts, setUserCounts] = useState<UserCounts>({
    totalUsers: 0,
    adminCount: 0,
    customerCount: 0,
    staffCount: 0,
    chefCount: 0,
  })
  const [lineChartData, setLineChartData] = useState<LineChartData>({
    months: [],
    subscribers: [],
    year: currentDate.getFullYear(),
  })
  const [barChartData, setBarChartData] = useState<BarChartData>({
    days: [],
    subscribers: [],
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1,
  })
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1)

  useEffect(() => {
    const fetchUserCounts = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/revenue/quantity")
        setUserCounts(response.data)
      } catch (error) {
        console.error("Error fetching user counts:", error)
      }
    }
    fetchUserCounts()
  }, [])

  useEffect(() => {
    const fetchLineChartData = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/revenue/line-chart?year=${selectedYear}`)
        setLineChartData(response.data)
      } catch (error) {
        console.error("Error fetching line chart data:", error)
      }
    }
    fetchLineChartData()
  }, [selectedYear])

  useEffect(() => {
    const fetchBarChartData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/revenue/bar-chart?year=${selectedYear}&month=${selectedMonth}`,
        )
        setBarChartData(response.data)
      } catch (error) {
        console.error("Error fetching bar chart data:", error)
      }
    }
    fetchBarChartData()
  }, [selectedYear, selectedMonth])

  const handleLineChartClick = (event: any, elements: any) => {
    if (elements.length > 0) {
      const clickedIndex = elements[0].index
      const clickedMonth = lineChartData.months[clickedIndex]
      setSelectedMonth(clickedMonth)
    }
  }

  const lineChartConfig = {
    labels: lineChartData.months.map((month) => {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      return monthNames[month - 1]
    }),
    datasets: [
      {
        label: "Users",
        data: lineChartData.subscribers,
        borderColor: "#1E90FF",
        backgroundColor: "#1E90FF",
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 0,
      },
    ],
  }

  const lineChartOptions = {
    scales: {
      y: { beginAtZero: true },
    },
    onClick: handleLineChartClick,
    plugins: {
      legend: { position: "top" as const },
      title: { display: false },
      tooltip: {
        enabled: true,
        mode: "index" as const,
        intersect: false,
        callbacks: {
          title: () => "Click to view daily data",
          label: (context: any) => `Subscribers: ${context.raw}`,
        },
      },
      annotation: {
        annotations: {
          verticalLine: {
            type: "line" as const,
            scaleID: "x",
            value: undefined,
            borderColor: "#1E90FF",
            borderWidth: 2,
            drawTime: "afterDatasetsDraw" as const,
          },
          intersectionPoint: {
            type: "point" as const,
            xValue: undefined,
            yValue: undefined,
            backgroundColor: "#1E90FF",
            radius: 5,
            borderColor: "#fff",
            borderWidth: 2,
          },
        },
      },
    },
    hover: {
      mode: "index" as const,
      intersect: false,
    },
    onHover: (event: any, chartElements: any, chart: any) => {
      const chartArea = chart.chartArea
      const mouseX = event.x - chartArea.left
      const labelWidth = (chartArea.right - chartArea.left) / lineChartConfig.labels.length
      const index = Math.floor(mouseX / labelWidth)

      if (index >= 0 && index < lineChartConfig.labels.length) {
        const label = lineChartConfig.labels[index]
        const yValue = lineChartData.subscribers[index]

        chart.options.plugins.annotation.annotations.verticalLine.value = label
        chart.options.plugins.annotation.annotations.intersectionPoint.xValue = label
        chart.options.plugins.annotation.annotations.intersectionPoint.yValue = yValue

        chart.tooltip.setActiveElements([{ datasetIndex: 0, index }], { x: event.x, y: event.y })
      } else {
        chart.options.plugins.annotation.annotations.verticalLine.value = undefined
        chart.options.plugins.annotation.annotations.intersectionPoint.xValue = undefined
        chart.options.plugins.annotation.annotations.intersectionPoint.yValue = undefined
      }

      chart.update()
    },
  }

  const barChartConfig = {
    labels: barChartData.days.map((day) => `Day ${day}`),
    datasets: [
      {
        label: "Users",
        data: barChartData.subscribers,
        backgroundColor: "#1E90FF",
      },
    ],
  }

  return (
    <div className="w-[1200px] mb-5">
      <div className="flex justify-between mb-5">
        <div className="bg-white p-5 rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.1)] w-[18%] text-center transition-transform duration-200 hover:-translate-y-[5px]">
          <FaUser className="text-2xl text-[#1E90FF] mb-2.5" />
          <h3 className="text-2xl my-[10px_0_5px] text-gray-800">{userCounts.totalUsers}</h3>
          <p className="text-sm text-gray-500 my-[5px_0]">Total Users</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.1)] w-[18%] text-center transition-transform duration-200 hover:-translate-y-[5px]">
          <FaUserShield className="text-2xl text-[#1E90FF] mb-2.5" />
          <h3 className="text-2xl my-[10px_0_5px] text-gray-800">{userCounts.adminCount}</h3>
          <p className="text-sm text-gray-500 my-[5px_0]">Admins</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.1)] w-[18%] text-center transition-transform duration-200 hover:-translate-y-[5px]">
          <FaUserFriends className="text-2xl text-[#1E90FF] mb-2.5" />
          <h3 className="text-2xl my-[10px_0_5px] text-gray-800">{userCounts.customerCount}</h3>
          <p className="text-sm text-gray-500 my-[5px_0]">Customers</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.1)] w-[18%] text-center transition-transform duration-200 hover:-translate-y-[5px]">
          <FaUserTie className="text-2xl text-[#1E90FF] mb-2.5" />
          <h3 className="text-2xl my-[10px_0_5px] text-gray-800">{userCounts.staffCount}</h3>
          <p className="text-sm text-gray-500 my-[5px_0]">Staff</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.1)] w-[18%] text-center transition-transform duration-200 hover:-translate-y-[5px]">
          <FaUtensils className="text-2xl text-[#1E90FF] mb-2.5" />
          <h3 className="text-2xl my-[10px_0_5px] text-gray-800">{userCounts.chefCount}</h3>
          <p className="text-sm text-gray-500 my-[5px_0]">Chefs</p>
        </div>
      </div>

      <div className="flex justify-between">
        <div className="bg-white p-5 rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.1)] w-[49%]">
          <div className="flex justify-between items-center mb-2.5">
            <h4 className="text-lg m-0">Monthly Visitors</h4>
            <div className="inline-block">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number.parseInt(e.target.value))}
                className="py-[5px] px-[10px] rounded-md border border-gray-300 text-sm cursor-pointer"
              >
                <option value={2023}>2023</option>
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
              </select>
            </div>
          </div>
          <div className="relative">
            <Line data={lineChartConfig} options={lineChartOptions} />
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.1)] w-[49%]">
          <h4 className="text-lg m-0">
            Daily Visitors ({selectedMonth}/{selectedYear})
          </h4>
          <p className="text-xs text-gray-500 m-0 mb-2.5">Click on a month in the line chart to view daily data.</p>
          <Bar
            data={barChartConfig}
            options={{
              scales: { y: { beginAtZero: true } },
              plugins: {
                legend: { position: "top" as const },
                title: { display: false },
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default StatisticUser
