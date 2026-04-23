import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
	constructor(
		@InjectRepository(Notification)
		private readonly notificationsRepository: Repository<Notification>,
	) {}

	async logNotification(eventType: string, payload: Record<string, unknown>) {
		const notification = this.notificationsRepository.create({
			eventType,
			payload,
			status: 'RECEIVED',
		});

		return this.notificationsRepository.save(notification);
	}
}
