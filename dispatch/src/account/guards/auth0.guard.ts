import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";

@Injectable()
export class Auth0Guard extends AuthGuard("auth0") {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        console.log('DOMAIN:',process.env.AUTH0_DOMAIN)
        console.log('Inside Auth0 Guard');
        return super.canActivate(context);
    }
}