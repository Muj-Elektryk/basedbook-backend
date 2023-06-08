import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from './chat.service';
import { GetUser } from '../auth/decorator/getUser.decorator';
import { JwtAuthDto } from '../auth/dto/jwt-auth.dto';
import { AddUserDto } from './dto/addUser.dto';
import { CreateConversationDto } from './dto/createConversation.dto';
import { EditDto } from './dto/edit.dto';
import { SendDto } from './dto/send.dto';
import { UpdateConversationNameDto } from './dto/updateConversationName.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}
  @Get('messages/:conversationId')
  async getConversation(
    @Param('conversationId') conversationId: string,
    @Query('skip') skip = '0',
    @Query('take') take = '10',
    @GetUser() user: JwtAuthDto,
  ) {
    if (isNaN(+conversationId)) {
      return [];
    }
    const conversation = await this.chatService.getConversation(
      user.userId,
      parseInt(conversationId),
      parseInt(skip),
      parseInt(take),
    );
    return this.convertBigIntToString(conversation);
  }

  @Get('conversations/')
  async getUserConversations(@GetUser() user: JwtAuthDto) {
    const conversations = await this.chatService.getUserConversations(
      user.userId,
    );
    return this.convertBigIntToString(conversations);
  }

  @Get('conversation/:conversationId/members')
  async getConversationMembers(
    @GetUser() user: JwtAuthDto,
    @Param('conversationId') conversationId: string,
  ) {
    return await this.chatService.getConversationMembers(
      user.userId,
      parseInt(conversationId),
    );
  }

  @Post('conversation/add')
  async addConversationMember(
    @Body() body: AddUserDto,
    @GetUser() user: JwtAuthDto,
  ) {
    console.log(body);
    await this.chatService.addConversationMember(body, user.userId);
    return { body, statusCode: 201 };
  }

  @Get('invitations/:conversationId/accept')
  async acceptInvitation(
    @Param('conversationId') conversationId: string,
    @GetUser() user: JwtAuthDto,
  ) {
    await this.chatService.acceptInvitation(+conversationId, user.userId);
    return { statusCode: 201 };
  }

  @Get('invitations')
  async getInvitations(@GetUser() user: JwtAuthDto) {
    console.log(user.userId);
    return this.chatService.getUserInvitations(user.userId);
  }

  @Get('invitations/number')
  async getNumberOfInvitations(@GetUser() user: JwtAuthDto) {
    return this.chatService.getNumberOfInvitations(user.userId);
  }

  @Get('numberOfUnreadMessages/:conversationId')
  async getNumberOfUnreadMessages(
    @GetUser() user: JwtAuthDto,
    @Param('conversationId') conversationId: string,
  ) {
    return this.chatService.getNumberOfUnreadMessages(
      user.userId,
      +conversationId,
    );
  }

  @Get('read/:conversationId')
  async readMessages(
    @GetUser() user: JwtAuthDto,
    @Param('conversationId') conversationId: string,
  ) {
    return this.chatService.readMessages(user.userId, +conversationId);
  }

  @Delete('invitations/:conversationId/decline')
  async declineInvitation(
    @GetUser() user: JwtAuthDto,
    @Param('conversationId') conversationId: string,
  ) {
    await this.chatService.declineInvitation(+conversationId, user.userId);
    return { statusCode: 204 };
  }

  @Delete('conversation/leave/:conversationId')
  async leaveConversation(
    @GetUser() user: JwtAuthDto,
    @Param('conversationId') conversationId: string,
  ) {
    await this.chatService.removeUserFromConversation(
      user.userId,
      parseInt(conversationId),
      user.userId,
    );
    return { statusCode: 204 };
  }

  @Delete('conversation/remove')
  async removeUserFromConversation(
    @GetUser() user: JwtAuthDto,
    @Query('userId') userId: string,
    @Query('conversationId') conversationId: string,
  ) {
    await this.chatService.removeUserFromConversation(
      parseInt(userId),
      parseInt(conversationId),
      user.userId,
    );
  }

  @Post('conversation/create')
  async createConversation(
    @Body() body: CreateConversationDto,
    @GetUser() user: JwtAuthDto,
  ) {
    await this.chatService.createConversation(user.userId, body.name);
    return { statusCode: 201 };
  }

  @Post('conversation/admin')
  async addAdmin(
    @Body() body: AddUserDto,
    @GetUser() user: JwtAuthDto,
  ): Promise<any> {
    await this.chatService.addAdmin(
      body.userId,
      body.conversationId,
      user.userId,
    );
    return { statusCode: 201 };
  }

  @Delete('conversation/admin')
  async removeAdmin(
    @GetUser() user: JwtAuthDto,
    @Query('userId') userId: string,
    @Query('conversationId') conversationId: string,
  ) {
    await this.chatService.removeAdmin(
      parseInt(userId),
      parseInt(conversationId),
      user.userId,
    );
  }

  @Post('send')
  async sendMessage(@Body() dto: SendDto, @GetUser() user: JwtAuthDto) {
    await this.chatService.sendMessage(
      dto.content,
      user.userId,
      dto.conversation,
    );
  }

  @Put('edit/:messageId')
  async editMessage(
    @GetUser() user: JwtAuthDto,
    @Body() dto: EditDto,
    @Param('messageId') messageId: string,
  ) {
    return await this.chatService.editMessage(
      user.userId,
      +messageId,
      dto.content,
    );
  }

  @Delete('delete/:messageId')
  async deleteMessage(
    @GetUser() user: JwtAuthDto,
    @Param('messageId') messageId: string,
  ) {
    return await this.chatService.deleteMessage(user.userId, +messageId);
  }
  @Put('updateName/:conversationId')
  async updateConversationName(
    @Body() body: UpdateConversationNameDto,
    @GetUser() user: JwtAuthDto,
    @Param('conversationId') conversationId: string,
  ) {
    await this.chatService.updateConversationName(
      user.userId,
      parseInt(conversationId),
      body.name,
    );
    return { statusCode: 204 };
  }

  convertBigIntToString(obj: any): any {
    if (obj instanceof Object) {
      for (const prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          obj[prop] = this.convertBigIntToString(obj[prop]);
        }
      }
    } else if (typeof obj === 'bigint') {
      obj = obj.toString();
    }
    return obj;
  }
}
