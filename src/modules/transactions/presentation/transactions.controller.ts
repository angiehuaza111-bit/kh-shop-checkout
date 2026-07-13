import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateTransactionUseCase } from '../application/use-cases/create-transaction.use-case';
import { GetTransactionUseCase } from '../application/use-cases/get-transaction.use-case';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly getTransactionUseCase: GetTransactionUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a checkout transaction and charge the tokenized card' })
  async create(@Body() dto: CreateTransactionDto): Promise<TransactionResponseDto> {
    const transaction = await this.createTransactionUseCase.execute({
      items: dto.items,
      customerEmail: dto.customerEmail,
      cardToken: dto.cardToken,
      installments: dto.installments ?? 1,
    });
    return TransactionResponseDto.fromDomain(transaction);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get the current status of a transaction' })
  async getById(@Param('id', ParseUUIDPipe) id: string): Promise<TransactionResponseDto> {
    const transaction = await this.getTransactionUseCase.execute(id);
    return TransactionResponseDto.fromDomain(transaction);
  }
}
