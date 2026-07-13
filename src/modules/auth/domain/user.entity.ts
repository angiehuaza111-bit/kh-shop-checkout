import { Role } from './role.enum';

export interface UserProps {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  refreshTokenHash: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private constructor(private readonly props: UserProps) {}

  static fromPersistence(props: UserProps): User {
    return new User(props);
  }

  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get role(): Role {
    return this.props.role;
  }

  get refreshTokenHash(): string | null {
    return this.props.refreshTokenHash;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  setRefreshTokenHash(hash: string | null): void {
    this.props.refreshTokenHash = hash;
    this.props.updatedAt = new Date();
  }

  toProps(): UserProps {
    return { ...this.props };
  }
}
