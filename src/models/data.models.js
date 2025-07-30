import mongoose, { Schema } from 'mongoose';

const dataSchema = new Schema(
  {
    userName: {
      type: String,
      required: [true, 'Data \'userName\' is required'],
      minlength: [3, 'Data \'userName\' must be at least 3 characters'],
      maxlength: [20, 'Data \'userName\' must be at most 20 characters'],
      unique: [true, 'Data \'userName\' already exists'],
      lowercase: true,
      trim: true,
      index: true,
    },
    initialPrompt: {
      type: String,
      required: [true, 'Data \'initialPrompt\' is required'],
    },
    txtData: {
      type: String,
    }
  },
  { timestamps: true } // Creates createdAt and updatedAt fields
);

export const Data = mongoose.model('Data', dataSchema);
