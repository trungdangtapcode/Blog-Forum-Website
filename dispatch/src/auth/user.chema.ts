import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: false, unique: false })
  username: string;

  @Prop({ required: false, unique: false })
  name: string;

    @Prop({ required: false, unique: false })
    age: number;
    @Prop({ required: false, unique: false })
    occupation: string;
    @Prop({ required: false, unique: false })
    hobbies: string;
    @Prop({ required: false, unique: false })
    interests: string;
    @Prop({ required: false, unique: false })
    gender: string;

  @Prop({ required: false, unique: false })
  historyUrls: string[];

  @Prop({ required: false, unique: false })
  learningData: [
    {
      word_id: number,
      time: number,
      point: number,
    },
  ];

  @Prop({ required: false, unique: false })
  decks: [
    {
      deckId: string,
      name: string,
      description: string,
      cards: 
        {
          question: string,
          answer: string,
          confidence: number
        }[] //OMG I can fk do this :D, [ClassA] <> ClassA[]
    }
  ];
}


// @Schema()
// class Card extends Document {
//   @Prop({ required: true })
//   question: string;
//   @Prop({ required: true })
//   answer: string;
//   @Prop({ required: false })
//   confidence: number;
// }

export const UserSchema = SchemaFactory.createForClass(User);
