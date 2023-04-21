import { Injectable } from '@nestjs/common';
import { Client } from 'pg';
import { Cart } from '../models';

const dbParams = {
    user: process.env.DBUSER,
    host: process.env.DBHOST,
    database: process.env.DBNAME,
    password: process.env.DBPASSWORD,
    port: process.env.DBPORT
};

const client = new Client(dbParams);

@Injectable()
export class CartService {
  private userCarts: Record<string, Cart> = {};

  async findByUserId(userId: string):Promise<Cart> {
    try {
      await client.connect();
      const cart = await client.query(`select * from carts where user_id='${userId}'`);
      
      if (cart && cart.rows && cart.rows.length > 0) {
        console.log('CART', cart.rows[0]);
        const cartId = cart.rows[0].id;
        let items = [];
        
        const cartItems = await client.query(`select * from cart_items where cart_id='${cartId}'`);
        if (cartItems && cartItems.rows && cartItems.rows.length > 0) {
          items = cartItems.rows.map((item) => {
            return {count: item.count, product: {id:item.product_id, title:'title', description:'description', price:1}};
          }); 
        }

        const result = { id: cartId, items: items};
        return result;
      }

      return;
    } catch (error) {
      console.error('ERROR in findByUserId');
    } finally {
      client.end();
    }
  }

  async createByUserId(userId: string) {
    try {
      await client.connect();
      const date = new Date();
      const result = await client.query(`insert into carts (user_id, created_at, updated_at, status) values ('${userId}', '${date}', '${date}', 'OPEN')`);

      return result;
    } catch (error) {
      console.error('ERROR in createByUserId');
    } finally {
      client.end();
    }
  }

  async findOrCreateByUserId(userId: string): Promise<Cart>{
    const userCart = await this.findByUserId(userId);

    if (userCart) {
      return userCart;
    }

    return this.createByUserId(userId);
  }

  async updateByUserId(userId: string, { items }: Cart): Promise<Cart> {
    try {
      const { id, ...rest } = await this.findOrCreateByUserId(userId);
      await client.connect();
      for (const item of items) {
        await client.query(`update cart_items set product_id=${item.product.id}, count=${item.count} where cart_id='${id}'`);
      }
      const result = await client.query(`update carts set updated_at=${new Date()} where id='${id}'`);
      return result;
    } catch (error) {
      console.error('ERROR in updateByUserId');
    } finally {
      client.end();
    }
  }

  async removeByUserId(userId): Promise<void> {
    try {
      await client.connect();
      const cart = await client.query(`select * from carts where user_id='${userId}'`);
      if (cart && cart.rows && cart.rows.length > 0) {
        
        const cartId = cart.rows[0].id;
        console.log('TO DELETE', cartId);
        await client.query(`delete from cart_items where user_id='${cartId}'`);
        await client.query(`delete from carts where user_id='${userId}'`);
      }
      return;
    } catch (error) {
      console.error('ERROR in removeByUserId');
    } finally {
      client.end();
    }
  }

}
