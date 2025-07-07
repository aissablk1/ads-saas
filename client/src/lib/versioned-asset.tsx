import React from 'react';
import Image from 'next/image';
import Script from 'next/script';
import { useCacheBuster } from './cache-buster';

interface VersionedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  fill?: boolean;
  sizes?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

/**
 * Composant Image avec cache busting automatique
 */
export function VersionedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 75,
  fill = false,
  sizes,
  style,
  onClick,
  ...props
}: VersionedImageProps) {
  const { getImageUrl } = useCacheBuster();
  const versionedSrc = getImageUrl(src);

  return (
    <Image
      src={versionedSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      quality={quality}
      fill={fill}
      sizes={sizes}
      style={style}
      onClick={onClick}
      {...props}
    />
  );
}

interface VersionedScriptProps {
  src: string;
  strategy?: 'beforeInteractive' | 'afterInteractive' | 'lazyOnload';
  onLoad?: () => void;
  onError?: () => void;
  id?: string;
  className?: string;
}

/**
 * Composant Script avec cache busting automatique
 */
export function VersionedScript({
  src,
  strategy = 'afterInteractive',
  onLoad,
  onError,
  id,
  className,
  ...props
}: VersionedScriptProps) {
  const { getScriptUrl } = useCacheBuster();
  const versionedSrc = getScriptUrl(src);

  return (
    <Script
      src={versionedSrc}
      strategy={strategy}
      onLoad={onLoad}
      onError={onError}
      id={id}
      className={className}
      {...props}
    />
  );
}

interface VersionedLinkProps {
  href: string;
  rel?: string;
  type?: string;
  media?: string;
  className?: string;
  id?: string;
}

/**
 * Composant Link pour les styles avec cache busting automatique
 */
export function VersionedLink({
  href,
  rel = 'stylesheet',
  type = 'text/css',
  media,
  className,
  id,
  ...props
}: VersionedLinkProps) {
  const { getStyleUrl } = useCacheBuster();
  const versionedHref = getStyleUrl(href);

  return (
    <link
      href={versionedHref}
      rel={rel}
      type={type}
      media={media}
      className={className}
      id={id}
      {...props}
    />
  );
}

interface VersionedAssetProps {
  src: string;
  type: 'image' | 'script' | 'style' | 'font' | 'video' | 'audio';
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  [key: string]: any;
}

/**
 * Composant générique pour tous les types d'assets avec cache busting
 */
export function VersionedAsset({
  src,
  type,
  alt,
  className,
  style,
  onClick,
  ...props
}: VersionedAssetProps) {
  const { addVersion } = useCacheBuster();
  const versionedSrc = addVersion(src);

  switch (type) {
    case 'image':
      return (
        <img
          src={versionedSrc}
          alt={alt || ''}
          className={className}
          style={style}
          onClick={onClick}
          {...props}
        />
      );

    case 'script':
      return (
        <script
          src={versionedSrc}
          className={className}
          {...props}
        />
      );

    case 'style':
      return (
        <link
          href={versionedSrc}
          rel="stylesheet"
          type="text/css"
          className={className}
          {...props}
        />
      );

    case 'font':
      return (
        <link
          href={versionedSrc}
          rel="preload"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
          className={className}
          {...props}
        />
      );

    case 'video':
      return (
        <video
          src={versionedSrc}
          className={className}
          style={style}
          onClick={onClick}
          {...props}
        />
      );

    case 'audio':
      return (
        <audio
          src={versionedSrc}
          className={className}
          style={style}
          onClick={onClick}
          {...props}
        />
      );

    default:
      return (
        <img
          src={versionedSrc}
          alt={alt || ''}
          className={className}
          style={style}
          onClick={onClick}
          {...props}
        />
      );
  }
}

/**
 * Hook pour obtenir une URL versionnée
 */
export function useVersionedUrl(url: string): string {
  const { addVersion } = useCacheBuster();
  return addVersion(url);
}

/**
 * Hook pour obtenir plusieurs URLs versionnées
 */
export function useVersionedUrls(urls: Record<string, string>): Record<string, string> {
  const { createVersionedUrls } = useCacheBuster();
  return createVersionedUrls(urls);
} 