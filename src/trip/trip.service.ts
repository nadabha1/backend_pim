import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError } from 'rxjs/operators';
import { lastValueFrom } from 'rxjs';
import { delay, retryWhen } from 'rxjs';

@Injectable()
export class TripPlanningService {
  constructor(private readonly httpService: HttpService) {}

  async generatePlan(tripDetails: { destination: string; days: number }) {
    try {
      console.log('🟢 Trip details:', tripDetails);

      // Hugging Face API endpoint and model setup
      const response = await lastValueFrom(
        this.httpService.post(
          'https://api-inference.huggingface.co/models/microsoft/t5-base',  // Replace with your Hugging Face model URL
          {
            inputs: `Generate a ${tripDetails.days}-day trip plan to ${tripDetails.destination}. Provide detailed daily activities, such as sightseeing, dining, and local experiences.`,
          },
          {
            headers: {
              'Authorization': `Bearer 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`,  // Replace with your Hugging Face API key
              'Content-Type': 'application/json',
            },
          }
        ).pipe(
          retryWhen(errors =>
            errors.pipe(
              delay(1000),  // Retry after 1 second
              catchError(err => {
                console.error('🔴 Error calling Hugging Face API:', err);
                throw err;
              })
            )
          ),
          catchError((err) => {
            console.error('🔴 Error calling Hugging Face API:', err);
            throw new Error('Error calling Hugging Face API: ' + err);
          })
        )
      );

      console.log('🟢 Hugging Face response:', response.data);
      return response.data[0]?.generated_text;  // Assuming Hugging Face model returns generated text in the `generated_text` field
    } catch (error) {
      console.error('🔴 Failed to generate trip plan:', error);
      throw new Error('Failed to generate trip plan');
    }
  }
}
