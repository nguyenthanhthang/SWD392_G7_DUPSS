import mongoose, { Document, Schema } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  capacity: number;
  registeredUsers: mongoose.Types.ObjectId[];
  consultantId: mongoose.Types.ObjectId;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  checkedInUsers: {
    userId: mongoose.Types.ObjectId;
    checkedInAt: Date;
  }[];
  qrCodeSecret: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Tiêu đề sự kiện là bắt buộc"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Mô tả sự kiện là bắt buộc"],
    },
    startDate: {
      type: Date,
      required: [true, "Ngày bắt đầu là bắt buộc"],
    },
    endDate: {
      type: Date,
      required: [true, "Ngày kết thúc là bắt buộc"],
    },
    location: {
      type: String,
      required: [true, "Địa điểm là bắt buộc"],
    },
    capacity: {
      type: Number,
      required: [true, "Số lượng người tham gia tối đa là bắt buộc"],
      min: [1, "Số lượng người tham gia phải lớn hơn 0"],
    },
    registeredUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "Account",
      },
    ],
    consultantId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "ID tư vấn viên là bắt buộc"],
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
    checkedInUsers: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "Account",
          required: true,
        },
        checkedInAt: {
          type: Date,
          required: true,
        },
      },
    ],
    qrCodeSecret: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomUUID(),
    },
  },
  {
    timestamps: true,
  }
);

// Middleware
eventSchema.pre("save", function (next) {
  const now = new Date();
  if (this.startDate > now) {
    this.status = "upcoming";
  } else if (this.endDate < now) {
    this.status = "completed";
  } else {
    this.status = "ongoing";
  }
  next();
});

const Event = mongoose.model<IEvent>("Event", eventSchema);
export default Event;
