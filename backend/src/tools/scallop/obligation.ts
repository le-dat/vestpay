import { getScallopSdk, client, createTimeout } from './sdk';

export async function buildOpenObligationTransaction(): Promise<{
  txBytes: string;
}> {
  try {
    const scallop = await getScallopSdk();
    const scallopClient = await scallop.createScallopClient();

    const txBlockPromise = scallopClient.openObligation(false);

    const txBlock = await Promise.race([txBlockPromise, createTimeout(30000)]);
    const txBytes = await (
      txBlock as {
        build: (options: { client: typeof client }) => Promise<Uint8Array>;
      }
    ).build({ client });

    return {
      txBytes: Buffer.from(txBytes).toString('base64'),
    };
  } catch (error) {
    console.error('Build open obligation transaction failed:', error);
    throw new Error(
      `Failed to build open obligation transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
