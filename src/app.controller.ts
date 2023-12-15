import { Body, Controller, Get, Post, Render, Res } from '@nestjs/common';
import * as mysql from 'mysql2';
import { AppService } from './app.service';
import { KuponDto } from './UjKupon.Dto';
import { Response } from 'express';

const conn = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'database',
}).promise();

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  async index() {
    
    const [adatok] = await conn.execute('SELECT  id, title, percentage, code FROM kuponok ORDER BY title');
    console.log(adatok);
    
    return {
      kuponok:adatok 
    };
  }

  @Get('/ujKupon')
  @Render('ujKuponMegadas')
  ujKuponForm() {
    return { errors: [] };
  }

  @Post('/ujKupon')
  @Render('ujKuponMegadas')
  async ujKupon(@Body() ujKupon: KuponDto, @Res() res:Response) {
    const errors: string[] = [];
    const kuponCode=/[a-zA-Z]{4}-[0-9]{6}/;
    if(ujKupon.title == ''){
      errors.push('A elődást megadni kötelező')
    }
    if(ujKupon.percentage.toString() == ''){
      errors.push('Kedvezmény megadása kötelező')
    }
    if(ujKupon.percentage > 1 || ujKupon.percentage < 100) {
        errors.push('A kedvezmény csak 1-99-ig lehet megadni!')
    }
    if(ujKupon.code == ''){
      errors.push('Kuponkód megadása kötelező')
    }
    if(!kuponCode.test(ujKupon.code)){
      errors.push('Hibás a kuponkód! Próbálja meg a példa szerint megirni Példa: ABCD-123456')
    }
    
    const title = ujKupon.title;
    const percentage : number= ujKupon.percentage;
    const code = ujKupon.code;

    
    if(errors.length > 0){
      return {
        errors,
      };
    }
    else{
      const [ adatok ] = await conn.execute
      (
        'INSERT INTO kuponok (title, percentage, code) VALUES (?, ?, ?)',
        [title, percentage, code]
      );
      console.log(adatok);
      res.redirect('/');
    }
  }

}
