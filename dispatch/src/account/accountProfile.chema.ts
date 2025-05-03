import { Schema, Document } from 'mongoose';

// Define the interface for TypeScript type safety
export interface AccountProfile extends Document {
  avatar?: string;
  fullName: string;
  bio?: string;
  age?: number;
  location?: string;
  occupation?: string;
}

// Create the Mongoose schema
export const AccountProfileSchema = new Schema<AccountProfile>({
  avatar: {
    type: String,
    required: false, // @IsOptional()
    maxlength: 255, // @MaxLength(255)
  },
  fullName: {
    type: String,
    required: true, // @IsNotEmpty()
    maxlength: 50, // @MaxLength(50)
  },
  bio: {
    type: String,
    required: false, // @IsOptional()
    maxlength: 500, // @MaxLength(500)
  },
  age: {
    type: Number,
    required: false, // @IsOptional()
    min: 0, // @Min(0)
  },
  location: {
    type: String,
    required: false, // @IsOptional()
    maxlength: 100, // @MaxLength(100)
  },
  occupation: {
    type: String,
    required: false, // @IsOptional()
    maxlength: 100, // @MaxLength(100)
  },
}, {
  timestamps: true, // Optional: adds createdAt and updatedAt fields
});

// Export the schema for use in your Mongoose model
