import mongoose, { Schema, Document } from 'mongoose';

export interface ISponsor extends Document {
  fullName: string;
  email: string;
  status: 'active' | 'inactive' | 'isDeleted';
  ranking: 'platinum' | 'gold' | 'silver' | 'bronze';
  logo?: string;
  donation?: string;
  eventIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const sponsorSchema = new Schema<ISponsor>({
  fullName: {
    type: String,
    required: [true, 'Họ và tên là bắt buộc'],
    trim: true,
    maxlength: [100, 'Họ và tên không được vượt quá 100 ký tự']
  },
  email: {
    type: String,
    required: [true, 'Email là bắt buộc'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'isDeleted'],
    default: 'active'
  },
  ranking: {
    type: String,
    enum: ['platinum', 'gold', 'silver', 'bronze'],
    required: [true, 'Ranking là bắt buộc'],
    default: 'bronze'
  },
  logo: {
    type: String,
    trim: true
  },
  donation: {
    type: String,
    trim: true
  },
  eventIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Ít nhất một sự kiện là bắt buộc']
  }]
}, {
  timestamps: true
});

// Index để tối ưu truy vấn
sponsorSchema.index({ eventIds: 1, status: 1 });
sponsorSchema.index({ email: 1 });

export default mongoose.model<ISponsor>('Sponsor', sponsorSchema); 