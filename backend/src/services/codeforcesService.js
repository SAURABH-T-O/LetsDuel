import crypto from 'crypto';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

const CODEFORCES_API_BASE = 'https://codeforces.com/api';

const hasCodeforcesCredentials = () => {
  return Boolean(env.codeforces.apiKey && env.codeforces.apiSecret);
};

const createApiSignature = ({ methodName, params, secret }) => {
  const randomPrefix = crypto.randomBytes(3).toString('hex');
  const sortedParams = Object.entries(params)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  const signaturePayload = `${randomPrefix}/${methodName}?${sortedParams}#${secret}`;
  const digest = crypto.createHash('sha512').update(signaturePayload).digest('hex');

  return `${randomPrefix}${digest}`;
};

const buildCodeforcesUrl = (methodName, methodParams = {}) => {
  const params = {
    ...methodParams,
  };

  if (hasCodeforcesCredentials()) {
    params.apiKey = env.codeforces.apiKey;
    params.time = Math.floor(Date.now() / 1000);
    params.apiSig = createApiSignature({
      methodName,
      params,
      secret: env.codeforces.apiSecret,
    });
  }

  const query = new URLSearchParams();

  Object.entries(params)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .forEach(([key, value]) => {
      query.set(key, String(value));
    });

  return `${CODEFORCES_API_BASE}/${methodName}?${query.toString()}`;
};

const safeFetchJson = async (methodName, params = {}) => {
  const url = buildCodeforcesUrl(methodName, params);

  const response = await fetch(url, {
    headers: {
      accept: 'application/json',
      'user-agent': 'LetsDuelBackend/1.0',
    },
  });

  if (!response.ok) {
    throw new AppError('Unable to reach Codeforces right now', 502);
  }

  const data = await response.json();

  if (data.status !== 'OK') {
    throw new AppError(data.comment || 'Codeforces request failed', 400);
  }

  return data.result;
};

export const ensureCodeforcesHandleExists = async (handle) => {
  const users = await safeFetchJson('user.info', { handles: handle });

  if (!Array.isArray(users) || users.length === 0) {
    throw new AppError('Codeforces handle not found', 404);
  }

  return users[0];
};

export const verifyCodeforcesCompilationErrorToken = async ({ handle, token }) => {
  await ensureCodeforcesHandleExists(handle);

  const submissions = await safeFetchJson('user.status', {
    handle,
    from: 1,
    count: 20,
  });

  const normalizedToken = token.trim();

  const matchingSubmission = submissions.find((submission) => {
    const verdictMatches = submission.verdict === 'COMPILATION_ERROR';
    const problemName = submission.problem?.name || '';
    const programmingLanguage = submission.programmingLanguage || '';

    return (
      verdictMatches &&
      (problemName.includes(normalizedToken) || programmingLanguage.includes(normalizedToken))
    );
  });

  return {
    verified: Boolean(matchingSubmission),
    submission: matchingSubmission || null,
  };
};