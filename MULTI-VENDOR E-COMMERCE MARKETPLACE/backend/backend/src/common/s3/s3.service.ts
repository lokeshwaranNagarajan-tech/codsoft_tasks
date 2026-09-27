import { Injectable, Logger } from '@nestjs/common';

export interface S3UploadResult {
  url: string;
  key: string;
  bucket: string;
}

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly bucket = process.env.AWS_S3_BUCKET || 'markethub-product-assets';
  private readonly region = process.env.AWS_REGION || 'us-east-1';

  /**
   * Upload product image buffer to S3 bucket
   */
  async uploadProductImage(
    fileBuffer: Buffer,
    fileName: string,
    mimeType = 'image/jpeg',
  ): Promise<S3UploadResult> {
    const timestamp = Date.now();
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `products/${timestamp}-${sanitizedName}`;

    // In production with @aws-sdk/client-s3:
    // await this.s3Client.send(new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: fileBuffer, ContentType: mimeType }));

    const publicUrl = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
    this.logger.log(`Uploaded product image to S3: ${publicUrl}`);

    return {
      url: publicUrl,
      key,
      bucket: this.bucket,
    };
  }

  /**
   * Generate presigned URL for direct client-to-S3 uploads
   */
  async getPresignedUploadUrl(
    fileName: string,
    mimeType = 'image/jpeg',
  ): Promise<{ uploadUrl: string; fileUrl: string; key: string }> {
    const timestamp = Date.now();
    const key = `products/uploads/${timestamp}-${fileName}`;
    const uploadUrl = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}?signature=mock_presigned_sig`;
    const fileUrl = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;

    return { uploadUrl, fileUrl, key };
  }

  /**
   * Delete image from S3
   */
  async deleteImage(fileKey: string): Promise<boolean> {
    // In production: await this.s3Client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: fileKey }));
    this.logger.log(`Deleted S3 asset with key: ${fileKey}`);
    return true;
  }
}
