
import { redirect } from 'next/navigation';
export default function SignUp() {
	redirect('/auth/login?screen_hint=signup');
	return (
	<div>
	  <h1>Sign Up</h1>
	  <p>Welcome to the sign-up page!</p>
	</div>
  	);	
}
