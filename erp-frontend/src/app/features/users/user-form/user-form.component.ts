import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { NotificationService } from '../../../core/services/notification.service';
import { Role } from '../../../core/models/domain.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { CreateUserInput, UpdateUserInput, UserService } from '../user.service';
import { RoleService } from '../../roles/role.service';

/**
 * Alta/edición de usuario con Reactive Form. El modo lo determina el param `:id`.
 * En edición, email y contraseña no se modifican por este endpoint (updateUserSchema).
 */
@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    InputSwitchModule,
    PageHeaderComponent,
    LoadingSpinnerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-form.component.html',
})
export class UserFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(UserService);
  private readonly roleService = inject(RoleService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notify = inject(NotificationService);

  readonly saving = signal(false);
  readonly loadingData = signal(false);
  readonly roles = signal<Role[]>([]);
  readonly userId = signal<string | null>(null);
  readonly isEdit = computed(() => this.userId() !== null);

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    roleId: ['', [Validators.required]],
    isActive: [true],
  });

  ngOnInit(): void {
    this.loadRoles();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userId.set(id);
      // En edición email/contraseña no se envían: se deshabilita el email y se libera
      // la validación de contraseña (el campo no se muestra).
      this.form.controls.email.disable();
      this.form.controls.password.clearValidators();
      this.form.controls.password.updateValueAndValidity();
      this.loadUser(id);
    }
  }

  isInvalid(control: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[control];
    return c.invalid && (c.dirty || c.touched);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const raw = this.form.getRawValue();

    const request = this.isEdit()
      ? this.service.update(this.userId()!, {
          fullName: raw.fullName.trim(),
          roleId: raw.roleId,
          isActive: raw.isActive,
        } satisfies UpdateUserInput)
      : this.service.create({
          email: raw.email.trim(),
          password: raw.password,
          fullName: raw.fullName.trim(),
          roleId: raw.roleId,
        } satisfies CreateUserInput);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.notify.success(this.isEdit() ? 'Usuario actualizado.' : 'Usuario creado.');
        this.goBack();
      },
      error: () => this.saving.set(false),
    });
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }

  private loadRoles(): void {
    this.roleService.list().subscribe({ next: (roles) => this.roles.set(roles) });
  }

  private loadUser(id: string): void {
    this.loadingData.set(true);
    this.service.getById(id).subscribe({
      next: (u) => {
        this.form.patchValue({
          fullName: u.fullName,
          email: u.email,
          roleId: u.roleId,
          isActive: u.isActive,
        });
        this.loadingData.set(false);
      },
      error: () => {
        this.loadingData.set(false);
        this.goBack();
      },
    });
  }
}
