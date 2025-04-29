const User = require('../models/User');
const UserRole = require("../models/UserRole");
exports.getLineChartData = async (req, res) => {
    try {
      const currentDate = new Date();
      const year = req.query.year ? parseInt(req.query.year) : currentDate.getFullYear();
  
      if (isNaN(year)) {
        return res.status(400).json({ message: 'Invalid year parameter' });
      }
  
      const data = await User.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(`${year}-01-01T00:00:00Z`),  // Đảm bảo thời gian chuẩn
              $lte: new Date(`${year}-12-31T23:59:59Z`)
            },
            isActive: true
          }
        },
        {
          $group: {
            _id: { $month: '$createdAt' },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id': 1 }
        }
      ]);
  
      const monthlyData = Array(12).fill(0);
      data.forEach(item => {
        monthlyData[item._id - 1] = item.count;
      });
  
      res.json({
        months: Array.from({ length: 12 }, (_, i) => i + 1),
        subscribers: monthlyData,
        year: year
      });
    } catch (error) {
      res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  };
  

exports.getBarChartData = async (req, res) => {
  try {
    const currentDate = new Date();
    const year = req.query.year || currentDate.getFullYear();
    const month = req.query.month || String(currentDate.getMonth() + 1).padStart(2, '0');

    const daysInMonth = new Date(year, month, 0).getDate();
    
    const data = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-${month}-01`),
            $lte: new Date(`${year}-${month}-${daysInMonth}`)
          },
          isActive: true
        }
      },
      {
        $group: {
          _id: { $dayOfMonth: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    const dailyData = Array(daysInMonth).fill(0);
    data.forEach(item => {
      dailyData[item._id - 1] = item.count;
    });

    res.json({
      days: Array.from({ length: daysInMonth }, (_, i) => i + 1),
      subscribers: dailyData,
      year: parseInt(year),
      month: parseInt(month)
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

const ROLE_IDS = {
    admin: "67ac64afe072694cafa16e76",
    customer: "67ac64bbe072694cafa16e78",
    staff: "67ac64c7e072694cafa16e7a",
    chef: "67ac667ae072694cafa16e7c"
  };
  
  exports.getUserCounts = async (req, res) => {
    try {
      const activeUserIds = await User.find({ isActive: true }).distinct("_id");
  
      const totalUsers = activeUserIds.length;

      const adminCount = await UserRole.countDocuments({
        userId: { $in: activeUserIds },
        roleId: ROLE_IDS.admin
      });
  
      const customerCount = await UserRole.countDocuments({
        userId: { $in: activeUserIds },
        roleId: ROLE_IDS.customer
      });
  
      const staffCount = await UserRole.countDocuments({
        userId: { $in: activeUserIds },
        roleId: ROLE_IDS.staff
      });
  
      const chefCount = await UserRole.countDocuments({
        userId: { $in: activeUserIds },
        roleId: ROLE_IDS.chef
      });
  
      res.json({
        totalUsers,
        adminCount,
        customerCount,
        staffCount,
        chefCount
      });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  };
  