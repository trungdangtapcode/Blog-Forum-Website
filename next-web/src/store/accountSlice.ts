import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AccountState {
  profile: AccountProfile;
}
const tmp = {
    avatar: '/default-avatar.png',
    email: 'user@example.com',
    fullName: 'John sDoe',
    bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    age: 30,
    location: 'New York, NY',
    occupation: 'Software Engineer',
    _id: "123456",
    credit: 69
}
const initialState: AccountState = {
  profile: tmp,
};

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<AccountProfile>) => {
      state.profile = action.payload;
    },
  },
});

export const { setProfile } = accountSlice.actions;
export default accountSlice.reducer;
