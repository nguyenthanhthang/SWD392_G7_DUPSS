import { Request, Response } from 'express';
import Sponsor, { ISponsor } from '../models/Sponsor';



// Lấy tất cả sponsors
export const getAllSponsors = async (req: Request, res: Response) => {
  try {
    const sponsors = await Sponsor.find({ status: { $ne: 'isDeleted' } })
      .populate('eventIds', 'title')
      .sort({ createdAt: -1 });
    
    res.status(200).json(sponsors);
  } catch (error) {
    console.error('Error fetching sponsors:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách nhà tài trợ' });
  }
};

// Lấy sponsors theo event
export const getSponsorsByEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    
    const sponsors = await Sponsor.find({ 
      eventIds: eventId, 
      status: { $ne: 'isDeleted' } 
    })
    .populate('eventIds', 'title')
    .sort({ ranking: 1, createdAt: -1 });
    
    res.status(200).json(sponsors);
  } catch (error) {
    console.error('Error fetching sponsors by event:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách nhà tài trợ theo sự kiện' });
  }
};

// Lấy sponsor theo ID
export const getSponsorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const sponsor = await Sponsor.findById(id)
      .populate('eventIds', 'title');
    
    if (!sponsor) {
      return res.status(404).json({ message: 'Không tìm thấy nhà tài trợ' });
    }
    
    res.status(200).json(sponsor);
  } catch (error) {
    console.error('Error fetching sponsor:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy thông tin nhà tài trợ' });
  }
};

// Tạo sponsor mới
export const createSponsor = async (req: Request, res: Response) => {
  try {
    const { fullName, email, ranking, eventIds } = req.body;
    
    // Parse eventIds từ string thành array
    const eventIdsArray = Array.isArray(eventIds) ? eventIds : [eventIds];
    
    // Kiểm tra email đã tồn tại trong các event này chưa
    const existingSponsor = await Sponsor.findOne({ 
      email, 
      eventIds: { $in: eventIdsArray },
      status: { $ne: 'isDeleted' } 
    });
    
    if (existingSponsor) {
      return res.status(400).json({ message: 'Email này đã được sử dụng cho một trong các sự kiện này' });
    }
    
    const sponsorData: any = {
      fullName,
      email,
      ranking,
      eventIds: eventIdsArray
    };
    
    // Thêm logo nếu có
    if (req.body.logo) {
      sponsorData.logo = req.body.logo;
    }
    
    const sponsor = new Sponsor(sponsorData);
    
    const savedSponsor = await sponsor.save();
    const populatedSponsor = await savedSponsor.populate('eventIds', 'title');
    
    res.status(201).json(populatedSponsor);
  } catch (error) {
    console.error('Error creating sponsor:', error);
    res.status(500).json({ message: 'Lỗi server khi tạo nhà tài trợ' });
  }
};

// Cập nhật sponsor
export const updateSponsor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { fullName, email, ranking, status, eventIds, logo, donation } = req.body;
    
    const sponsor = await Sponsor.findById(id);
    
    if (!sponsor) {
      return res.status(404).json({ message: 'Không tìm thấy nhà tài trợ' });
    }
    
    // Parse eventIds từ string thành array nếu có
    const eventIdsArray = eventIds ? (Array.isArray(eventIds) ? eventIds : [eventIds]) : sponsor.eventIds;
    
    // Kiểm tra email đã tồn tại trong các event này chưa (trừ sponsor hiện tại)
    if (email && email !== sponsor.email) {
      const existingSponsor = await Sponsor.findOne({ 
        email, 
        eventIds: { $in: eventIdsArray },
        _id: { $ne: id },
        status: { $ne: 'isDeleted' } 
      });
      
      if (existingSponsor) {
        return res.status(400).json({ message: 'Email này đã được sử dụng cho một trong các sự kiện này' });
      }
    }
    
    const updateData: any = { fullName, email, ranking, status, eventIds: eventIdsArray, logo, donation };
    
    const updatedSponsor = await Sponsor.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('eventIds', 'title');
    
    res.status(200).json(updatedSponsor);
  } catch (error) {
    console.error('Error updating sponsor:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật nhà tài trợ' });
  }
};

// Xóa sponsor (soft delete)
export const deleteSponsor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const sponsor = await Sponsor.findById(id);
    
    if (!sponsor) {
      return res.status(404).json({ message: 'Không tìm thấy nhà tài trợ' });
    }
    
    await Sponsor.findByIdAndUpdate(id, { status: 'isDeleted' });
    
    res.status(200).json({ message: 'Xóa nhà tài trợ thành công' });
  } catch (error) {
    console.error('Error deleting sponsor:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa nhà tài trợ' });
  }
};

// Lấy thống kê sponsors theo ranking
export const getSponsorStats = async (req: Request, res: Response) => {
  try {
    const stats = await Sponsor.aggregate([
      { $match: { status: { $ne: 'isDeleted' } } },
      {
        $group: {
          _id: '$ranking',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    const rankingNames = {
      platinum: 'Bạch kim',
      gold: 'Vàng',
      silver: 'Bạc',
      bronze: 'Đồng'
    };
    
    const formattedStats = stats.map(stat => ({
      ranking: stat._id,
      rankingName: rankingNames[stat._id as keyof typeof rankingNames],
      count: stat.count
    }));
    
    res.status(200).json(formattedStats);
  } catch (error) {
    console.error('Error fetching sponsor stats:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy thống kê nhà tài trợ' });
  }
}; 