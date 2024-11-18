import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Customer } from '../../interface/customers';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss',
})
export class CustomersComponent implements OnInit{
  customers: Customer[] = [];

  ngOnInit(): void {

  }
}
